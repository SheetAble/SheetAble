package models

import (
	"errors"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	. "github.com/SheetAble/SheetAble/backend/api/config"

	"github.com/jinzhu/gorm"
	"github.com/kennygrant/sanitize"
)

type Composer struct {
	SafeName    string    `gorm:"primary_key" json:"safe_name"`
	Name        string    `json:"name"`
	PortraitURL string    `json:"portrait_url"`
	Epoch       string    `json:"epoch"`
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (c *Composer) Prepare() {
	c.Name = strings.TrimSpace(c.Name)
	c.SafeName = strings.TrimSpace(c.SafeName)
	c.PortraitURL = strings.TrimSpace(c.PortraitURL)
	c.Epoch = strings.TrimSpace(c.Epoch)
	c.CreatedAt = time.Now()
	c.UpdatedAt = time.Now()
}

func (c *Composer) SaveComposer(db *gorm.DB) (*Composer, error) {
	err := db.Model(&Sheet{}).Create(&c).Error
	if err != nil {
		return &Composer{}, err
	}
	return c, nil
}

func (c *Composer) UpdateComposer(db *gorm.DB, originalName string, updatedName string, portraitUrl string, epoch string, uploadSuccess bool) (*Composer, error) {

	composer, err := c.FindComposerBySafeName(db, originalName)
	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return &Composer{}, errors.New("Composer not found")
		}
		return &Composer{}, err
	}

	db.Delete(&composer)

	if updatedName != "" {
		composer.Name = updatedName
		composer.SafeName = sanitize.Name(updatedName)
	}
	if portraitUrl != "" {
		composer.PortraitURL = portraitUrl
	}
	if epoch != "" {
		composer.Epoch = epoch
	}
	if uploadSuccess {
		composer.PortraitURL = "/composer/portrait/" + composer.SafeName
	}

	composer.UpdatedAt = time.Now()

	db.Save(&composer)

	// Update Sheets with that composer
	db.Exec("UPDATE sheets SET pdf_url = REPLACE(pdf_url, ?, ?) WHERE safe_composer = ?;", originalName, sanitize.Name(updatedName), originalName)
	db.Model(&Sheet{}).Where("safe_composer = ?", originalName).Update("safe_composer", sanitize.Name(updatedName))
	db.Model(&Sheet{}).Where("safe_composer = ?", sanitize.Name(updatedName)).Update("composer", updatedName)
	// Rename folder
	p := path.Join(Config().ConfigPath, "sheets/uploaded-sheets/")
	os.Rename(p+"/"+originalName, p+"/"+sanitize.Name(updatedName))

	return composer, nil
}

func (c *Composer) DeleteComposer(db *gorm.DB, composerName string) (int64, error) {

	_, err := c.FindComposerBySafeName(db, composerName)
	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return 0, errors.New("composer not found")
		}
		return 0, err
	}

	// Create Unknown Composer if doesn't exist
	c.ProperComposerCheck(db, composerName)

	// Delete Composer
	db = db.Model(&Composer{}).Where("safe_name = ?", composerName).Take(&Composer{}).Delete(&Composer{})

	if db.Error != nil {
		if gorm.IsRecordNotFoundError(db.Error) {
			return 0, errors.New("composer not found")
		}
		return 0, db.Error
	}

	// Swap sheets composer to Unknown
	db.Exec("UPDATE 'sheets' SET 'composer' = 'Unknown' WHERE (safe_composer = ?);", composerName)
	db.Exec("UPDATE 'sheets' SET 'safe_composer' = 'unknown' WHERE (composer = ?);", "Unknown")
	db.Exec("UPDATE sheets SET pdf_url = REPLACE(pdf_url, ?, ?) WHERE safe_composer = ?;", composerName, "unknown", "unknown")

	confPath := path.Join(Config().ConfigPath, "sheets/uploaded-sheets/")

	// Move all files inside comp direcotry
	filepath.Walk(confPath+"/"+composerName,
		func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			if !info.IsDir() {

				pdfName := strings.Split(path, composerName)

				os.Rename(path, confPath+"/"+"unknown"+pdfName[1])
			}
			return nil
		})

	// Remove folder
	os.Remove(confPath + composerName)

	// Add Check for Unknown composer
	CheckAndDeleteUnknownComposer(db)

	return db.RowsAffected, nil
}

func (c *Composer) ProperComposerCheck(db *gorm.DB, composerName string) {
	/*
		Check how many sheets the composer has before deletion and if none dont create an unknown composer
		if yes create an unknown composer
	*/

	var sheets []Sheet

	result := db.Model(&Sheet{}).Where("safe_composer = ?", composerName).Find(&sheets)
	fmt.Println("erennn")
	fmt.Println("results etc etc")
	fmt.Println(result.RowsAffected)
	if result.RowsAffected >= 1 {
		// Create Unknown Composer if doesn't exist
		c.CreateUnknownComposer(db)
	}
}

func (c *Composer) CreateUnknownComposer(db *gorm.DB) {

	_, err := c.FindComposerBySafeName(db, "unknown")
	// Unknown doesn't exist yet
	if err != nil {
		c.Name = "Unknown"
		c.SafeName = "unknown"
		c.Epoch = "Unknown"
		c.PortraitURL = "https://icon-library.com/images/unknown-person-icon/unknown-person-icon-4.jpg"
		c.SaveComposer(db)

		// Create a folder/directory at a full qualified path
		err := os.Mkdir(path.Join(Config().ConfigPath, "sheets/uploaded-sheets/unknown"), 0755)
		if err != nil {
			fmt.Println(err)
		}
	}

}

func (c *Composer) FindComposerBySafeName(db *gorm.DB, composerName string) (*Composer, error) {

	// Get information of one single composer
	var err error
	err = db.Model(&Composer{}).Where("safe_name = ?", composerName).Take(&c).Error
	if err != nil {
		return &Composer{}, err
	}
	return c, nil
}

func (c *Composer) GetAllComposer(db *gorm.DB) (*[]Composer, error) {
	/*
		This method will return max 20 composer, to find more or specific one you need to specify it.
		Currently it sorts it by the newest updates
	*/
	var err error
	composers := []Composer{}

	err = db.Order("updated_at desc").Limit(20).Find(&composers).Error

	if err != nil {
		return &[]Composer{}, err
	}
	return &composers, err
}

func SearchComposer(db *gorm.DB, searchValue string) []*Composer {

	// Search for sheets with containing string
	var composers []*Composer
	searchValue = "%" + searchValue + "%"
	db.Where("safe_name LIKE ?", searchValue).Find(&composers)
	return composers
}

func (c *Composer) List(db *gorm.DB, pagination Pagination) (*Pagination, error) {

	// For pagination
	var composers []*Composer
	db.Scopes(paginate(composers, &pagination, db)).Find(&composers)
	pagination.Rows = composers

	return &pagination, nil
}

func CheckAndDeleteUnknownComposer(db *gorm.DB) {
	/*
		Method to check and delete the unknown composer.
		So if there are no sheets in unknown composer it will get deleted.
	*/

	var sheets []Sheet

	result := db.Model(&Sheet{}).Where("safe_composer = ?", "unknown").Find(&sheets)

	if result.RowsAffected <= 1 {
		db = db.Model(&Composer{}).Where("safe_name = ?", "unknown").Take(&Composer{}).Delete(&Composer{})
	}
}

package models

import (
	"errors"
	"log"
	"os"
	"path"
	"strings"
	"time"

	. "github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/lib/pq"

	"github.com/jinzhu/gorm"
)

type Sheet struct {
	SafeSheetName string `gorm:"primary_key" json:"safe_sheet_name"`
	SheetName     string `json:"sheet_name"`
	SafeComposer  string `json:"safe_composer"`
	Composer      string `json:"composer"`
	ReleaseDate   time.Time
	PdfUrl        string         `json:"pdf_url"`
	UploaderID    uint32         `gorm:"not null" json:"uploader_id"`
	CreatedAt     time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt     time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
	Tags          pq.StringArray `gorm:"type:text[]" json:"tags"`
}

func (s *Sheet) Prepare() {
	s.SheetName = strings.TrimSpace(s.SheetName)
	s.Composer = strings.TrimSpace(s.Composer)
	s.SafeComposer = strings.TrimSpace(s.SafeComposer)
	s.SafeSheetName = strings.TrimSpace(s.SafeSheetName)
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()
	s.PdfUrl = "sheet/pdf/" + s.SafeComposer + "/" + s.SafeSheetName
	s.Tags = pq.StringArray{}
}

func (s *Sheet) SaveSheet(db *gorm.DB) (*Sheet, error) {
	err := db.Model(&Sheet{}).Create(&s).Error
	if err != nil {
		return &Sheet{}, err
	}
	return s, nil
}

func (s *Sheet) DeleteSheet(db *gorm.DB, sheetName string) (int64, error) {

	sheet, err := s.FindSheetBySafeName(db, sheetName)
	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			return 0, errors.New("Sheet not found")
		}
		return 0, err
	}

	paths := []string{
		path.Join(Config().ConfigPath, "sheets/uploaded-sheets", sheet.SafeComposer, sheet.SafeSheetName+".pdf"),
		path.Join(Config().ConfigPath, "sheets/thumbnails", sheet.SafeSheetName+".png"),
	}

	for _, path := range paths {
		e := os.Remove(path)
		if e != nil {
			log.Fatal(e)
		}
	}

	db = db.Model(&Sheet{}).Where("safe_sheet_name = ?", sheetName).Take(&Sheet{}).Delete(&Sheet{})

	if db.Error != nil {
		if gorm.IsRecordNotFoundError(db.Error) {
			return 0, errors.New("Sheet not found")
		}
		return 0, db.Error
	}
	return db.RowsAffected, nil
}

func (s *Sheet) GetAllSheets(db *gorm.DB) (*[]Sheet, error) {
	/*
		This method will return max 20 sheets, to find more or specific one you need to specify it.
		Currently it sorts it by the newest updates
	*/
	var err error
	sheets := []Sheet{}

	err = db.Order("updated_at desc").Limit(20).Find(&sheets).Error

	if err != nil {
		return &[]Sheet{}, err
	}
	return &sheets, err
}

func (s *Sheet) FindSheetBySafeName(db *gorm.DB, sheetName string) (*Sheet, error) {
	/*
		Get information of one single sheet by the safe sheet name
	*/

	var err error
	err = db.Model(&Sheet{}).Where("safe_sheet_name = ?", sheetName).Take(&s).Error

	if err != nil {
		return &Sheet{}, err
	}
	return s, nil

}

func (s *Sheet) List(db *gorm.DB, pagination Pagination, composer string) (*Pagination, error) {
	/*
		For pagination
	*/

	var sheets []*Sheet
	if composer != "" {
		db.Scopes(ComposerEqual(composer), paginate(sheets, &pagination, db)).Find(&sheets)
	} else {
		db.Scopes(paginate(sheets, &pagination, db)).Find(&sheets)
	}

	pagination.Rows = sheets

	return &pagination, nil
}

func SearchSheet(db *gorm.DB, searchValue string) []*Sheet {
	/*
		Search for sheets with containing string
	*/

	var sheets []*Sheet
	searchValue = "%" + searchValue + "%"
	db.Where("sheet_name LIKE ?", searchValue).Find(&sheets)
	return sheets
}

func ComposerEqual(composer string) func(db *gorm.DB) *gorm.DB {
	/* Scope that composer is equal to composer (if you only want sheets from a certain composer) */
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("safe_composer = ?", composer)
	}
}

func (s *Sheet) AppendTag(db *gorm.DB, appendTag string) {
	/*
		Append a new tag to a sheet
	*/

	newArray := append(s.Tags, appendTag)

	db.Model(&s).Update(Sheet{Tags: newArray})
}

func (s *Sheet) DelteTag(db *gorm.DB, value string) bool {
	/*
		Deleting a tag by it's value
	*/

	index := utils.FindIndexByValue(s.Tags, value)

	if index == -1 {
		return false
	}

	newArray := pq.StringArray(utils.RemoveElementOfSlice(s.Tags, index))

	db.Model(&s).Update(Sheet{Tags: newArray})

	return true
}

func FindSheetByTag(db *gorm.DB, tag string) []*Sheet {

	var allSheets []*Sheet
	var affectedSheets []*Sheet

	db.Find(&allSheets)

	for _, sheet := range allSheets {
		if utils.CheckSliceContains(sheet.Tags, "test") {
			affectedSheets = append(affectedSheets, sheet)
		}
	}

	return affectedSheets
}

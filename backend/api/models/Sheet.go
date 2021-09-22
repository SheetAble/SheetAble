package models

import (
	"errors"
	. "github.com/vallezw/SheetUploader-Selfhosted/backend/api/config"
	"log"
	"os"
	"path"
	"strings"
	"time"

	"github.com/jinzhu/gorm"
)

type Sheet struct {
	SafeSheetName string `gorm:"primary_key" json:"safe_sheet_name"`
	SheetName     string `json:"sheet_name"`
	SafeComposer  string `json:"safe_composer"`
	Composer      string `json:"composer"`
	ReleaseDate   time.Time
	PdfUrl        string    `json:"pdf_url"`
	UploaderID    uint32    `gorm:"not null" json:"uploader_id"`
	CreatedAt     time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt     time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (s *Sheet) Prepare() {
	s.SheetName = strings.TrimSpace(s.SheetName)
	s.Composer = strings.TrimSpace(s.Composer)
	s.SafeComposer = strings.TrimSpace(s.SafeComposer)
	s.SafeSheetName = strings.TrimSpace(s.SafeSheetName)
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()
	s.PdfUrl = "sheet/pdf/" + s.SafeComposer + "/" + s.SafeSheetName
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
		path.Join(Config().ConfigPath, "sheets/uploaded-sheets", sheet.SafeComposer, sheet.SafeSheetName + ".pdf"),
		path.Join(Config().ConfigPath, "sheets/thumbnails", sheet.SafeSheetName + ".png"),
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

func ComposerEqual(composer string) func(db *gorm.DB) *gorm.DB {
	/* Scope that composer is equal to composer (if you only want sheets from a certain composer) */
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("safe_composer = ?", composer)
	}
}

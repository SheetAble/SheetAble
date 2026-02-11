package models

import (
	"errors"
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
	SafeSheetName   string `gorm:"primary_key" json:"safe_sheet_name"`
	SheetName       string `json:"sheet_name"`
	SafeComposer    string `json:"safe_composer"`
	Composer        string `json:"composer"`
	ReleaseDate     time.Time
	PdfUrl          string         `json:"pdf_url"`
	UploaderID      uint32         `gorm:"not null" json:"uploader_id"`
	CreatedAt       time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
	Tags            pq.StringArray `gorm:"type:text[]" json:"tags"`
	InformationText string         `json:"information_text"`
	// Library sync fields
	FilePath    string `json:"file_path"`                        // Absolute path to PDF file (for synced files)
	FileHash    string `json:"file_hash"`                        // SHA256 hash for duplicate detection
	IsAvailable bool   `gorm:"default:true" json:"is_available"` // Whether file exists
	Source      string `gorm:"default:'uploaded'" json:"source"` // "uploaded" or "synced"
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
	// Set default source if not specified
	if s.Source == "" {
		s.Source = "uploaded"
	}
	// Default to available
	if s.Source == "uploaded" {
		s.IsAvailable = true
	}
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

	for _, p := range paths {
		if _, err := os.Stat(p); err == nil {
			_ = os.Remove(p)
		}
	}

	if sheet.SafeComposer == "unknown" {
		CheckAndDeleteUnknownComposer(db)
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

	// Only show available sheets
	err = db.Where("is_available = ?", true).Order("updated_at desc").Limit(20).Find(&sheets).Error

	if err != nil {
		return &[]Sheet{}, err
	}
	return &sheets, err
}

func (s *Sheet) FindSheetBySafeName(db *gorm.DB, sheetName string) (*Sheet, error) {

	// Get information of one single sheet by the safe sheet name
	var err error
	err = db.Model(&Sheet{}).Where("safe_sheet_name = ?", sheetName).Take(&s).Error

	if err != nil {
		return &Sheet{}, err
	}
	return s, nil

}

func (s *Sheet) List(db *gorm.DB, pagination Pagination, composer string) (*Pagination, error) {

	// For pagination

	var sheets []*Sheet
	// Only show available sheets
	query := db.Where("is_available = ?", true)

	if composer != "" {
		query.Scopes(ComposerEqual(composer), paginate(sheets, &pagination, query)).Find(&sheets)
	} else {
		query.Scopes(paginate(sheets, &pagination, query)).Find(&sheets)
	}

	pagination.Rows = sheets

	return &pagination, nil
}

func SearchSheet(db *gorm.DB, searchValue string) []*Sheet {

	// Search for sheets with containing string
	var sheets []*Sheet
	searchValue = "%" + searchValue + "%"
	// Only show available sheets
	db.Where("sheet_name LIKE ? AND is_available = ?", searchValue, true).Find(&sheets)
	return sheets
}

func ComposerEqual(composer string) func(db *gorm.DB) *gorm.DB {

	// Scope that composer is equal to composer (if you only want sheets from a certain composer)
	return func(db *gorm.DB) *gorm.DB {
		return db.Where("safe_composer = ?", composer)
	}
}

func (s *Sheet) AppendTag(db *gorm.DB, appendTag string) {

	// Append a new tag to a sheet
	newArray := append(s.Tags, appendTag)

	db.Model(&s).Update(Sheet{Tags: newArray})
}

func (s *Sheet) DelteTag(db *gorm.DB, value string) bool {

	// Deleting a tag by it's value
	index := utils.FindIndexByValue(s.Tags, value)

	if index == -1 {
		return false
	}

	newArray := pq.StringArray(utils.RemoveElementOfSlice(s.Tags, index))

	db.Model(&s).Update(Sheet{Tags: newArray})

	return true
}

func (S *Sheet) UpdateSheetInformationText(db *gorm.DB, value string, sheet *Sheet) *Sheet {
	sheet.InformationText = value
	db.Save(sheet)

	return sheet
}

func FindSheetByTag(db *gorm.DB, tag string) []*Sheet {

	var allSheets []*Sheet
	var affectedSheets []*Sheet

	db.Find(&allSheets)

	for _, sheet := range allSheets {
		if utils.CheckSliceContains(sheet.Tags, tag) {
			affectedSheets = append(affectedSheets, sheet)
		}
	}

	return affectedSheets
}

// FindSheetByHash finds a sheet by its file hash (for duplicate detection)
func FindSheetByHash(db *gorm.DB, hash string) (*Sheet, error) {
	var sheet Sheet
	err := db.Model(&Sheet{}).Where("file_hash = ?", hash).First(&sheet).Error
	if err != nil {
		return nil, err
	}
	return &sheet, nil
}

// MarkAsUnavailable marks a sheet as unavailable (file no longer exists)
func (s *Sheet) MarkAsUnavailable(db *gorm.DB) error {
	s.IsAvailable = false
	return db.Model(s).Update("is_available", false).Error
}

// UpdateFilePath updates the file path for a synced sheet
func (s *Sheet) UpdateFilePath(db *gorm.DB, newPath string) error {
	s.FilePath = newPath
	s.IsAvailable = true
	return db.Model(s).Updates(map[string]interface{}{
		"file_path":    newPath,
		"is_available": true,
	}).Error
}

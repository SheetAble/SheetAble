package models

import (
	"errors"
	"log"
	"math"
	"os"
	"path"
	"sort"
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
	Instruments     pq.StringArray `gorm:"type:text[]" json:"instruments"`
	InformationText string         `json:"information_text"`
}

func (s *Sheet) Prepare() {
	s.SheetName = strings.TrimSpace(s.SheetName)
	s.Composer = strings.TrimSpace(s.Composer)
	s.SafeComposer = strings.TrimSpace(s.SafeComposer)
	s.SafeSheetName = strings.TrimSpace(s.SafeSheetName)
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()
	s.PdfUrl = "sheet/pdf/" + s.SafeComposer + "/" + s.SafeSheetName
	if s.Tags == nil {
		s.Tags = pq.StringArray{}
	}
	if s.Instruments == nil {
		s.Instruments = pq.StringArray{}
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

	for _, path := range paths {
		e := os.Remove(path)
		if e != nil {
			log.Fatal(e)
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

	err = db.Order("updated_at desc").Limit(20).Find(&sheets).Error

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

func (s *Sheet) List(db *gorm.DB, pagination Pagination, composer string, instrument string) (*Pagination, error) {
	query := db.Model(&Sheet{})
	if composer != "" {
		query = query.Where("safe_composer = ?", composer)
	}
	sheets := make([]*Sheet, 0)
	if instrument == "" {
		if err := query.Count(&pagination.TotalRows).Error; err != nil {
			return nil, err
		}
		pagination.TotalPages = int(math.Ceil(float64(pagination.TotalRows) / float64(pagination.GetLimit())))
		if err := query.Order(pagination.GetSort()).Offset(pagination.GetOffset()).Limit(pagination.GetLimit()).Find(&sheets).Error; err != nil {
			return nil, err
		}
	} else {
		var allSheets []*Sheet
		if err := query.Order(pagination.GetSort()).Find(&allSheets).Error; err != nil {
			return nil, err
		}
		for _, sheet := range allSheets {
			for _, sheetInstrument := range sheet.Instruments {
				if strings.EqualFold(strings.TrimSpace(sheetInstrument), strings.TrimSpace(instrument)) {
					sheets = append(sheets, sheet)
					break
				}
			}
		}

		pagination.TotalRows = int64(len(sheets))
		pagination.TotalPages = int(math.Ceil(float64(pagination.TotalRows) / float64(pagination.GetLimit())))
		start := pagination.GetOffset()
		if start >= len(sheets) {
			sheets = []*Sheet{}
		} else {
			end := start + pagination.GetLimit()
			if end > len(sheets) {
				end = len(sheets)
			}
			sheets = sheets[start:end]
		}
	}

	pagination.Rows = sheets

	return &pagination, nil
}

func GetAllInstruments(db *gorm.DB) ([]string, error) {
	var sheets []Sheet
	if err := db.Select("instruments").Find(&sheets).Error; err != nil {
		return nil, err
	}

	instrumentsByName := make(map[string]string)
	for _, sheet := range sheets {
		for _, instrument := range sheet.Instruments {
			instrument = strings.TrimSpace(instrument)
			if instrument != "" {
				key := strings.ToLower(instrument)
				if current, exists := instrumentsByName[key]; !exists || instrument < current {
					instrumentsByName[key] = instrument
				}
			}
		}
	}

	instruments := make([]string, 0, len(instrumentsByName))
	for _, instrument := range instrumentsByName {
		instruments = append(instruments, instrument)
	}
	sort.Strings(instruments)
	return instruments, nil
}

func SearchSheet(db *gorm.DB, searchValue string) []*Sheet {

	// Search for sheets with containing string
	var sheets []*Sheet
	searchValue = "%" + searchValue + "%"
	db.Where("sheet_name LIKE ?", searchValue).Find(&sheets)
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

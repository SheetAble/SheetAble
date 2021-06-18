// TODO: Add rest functions

package models

import (
	"html"
	"strings"
	"time"

	"github.com/jinzhu/gorm"
)

type Sheet struct {
	SheetName   string `gorm:"primary_key" json:"sheet_name"`
	Composer    string `json:"composer"`
	ReleaseDate time.Time
	UploaderID  uint32    `gorm:"not null" json:"uploader_id"`
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (s *Sheet) Prepare() {
	s.SheetName = html.EscapeString(strings.TrimSpace(s.SheetName))
	s.Composer = html.EscapeString(strings.TrimSpace(s.Composer))
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()
}

func (s *Sheet) SaveSheet(db *gorm.DB) (*Sheet, error) {
	err := db.Debug().Model(&Sheet{}).Create(&s).Error
	if err != nil {
		return &Sheet{}, err
	}
	return s, nil
}

func (s *Sheet) GetAllSheets(db *gorm.DB) (*[]Sheet, error) {
	// This method will return max 20 sheets, to find more or specific one you need to specify it
	var err error
	sheets := []Sheet{}
	err = db.Debug().Model(&Sheet{}).Limit(20).Find(&sheets).Error
	if err != nil {
		return &[]Sheet{}, err
	}
	return &sheets, err
}

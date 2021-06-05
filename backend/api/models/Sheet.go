package models

import (
	"html"
	"strings"
	"time"

	"github.com/jinzhu/gorm"
)

type Sheet struct {
	SheetName string    `gorm:"primary_key" json:"sheet_name"`
	Author    User      `json:"author"`
	AuthorID  uint32    `gorm:"not null" json:"author_id"`
	CreatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (s *Sheet) Prepare() {
	s.SheetName = html.EscapeString(strings.TrimSpace(s.SheetName))
	s.Author = User{}
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()
}

func (s *Sheet) SaveSheet(db *gorm.DB) (*Sheet, error) {
	var err error
	err = db.Debug().Model(&Sheet{}).Create(&s).Error
	if err != nil {
		return &Sheet{}, err
	}
	if s.SheetName != "" {
		err = db.Debug().Model(&User{}).Where("id = ?", s.AuthorID).Take(&s.Author).Error
		if err != nil {
			return &Sheet{}, err
		}
	}
	return s, nil
}

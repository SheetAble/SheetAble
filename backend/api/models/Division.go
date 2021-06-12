// Divisons are categories, genres, tags

package models

import (
	"html"
	"strings"
	"time"

	"github.com/jinzhu/gorm"
)

type Division struct {
	Name         string    `gorm:"primary_key" json:"name"`
	DivisionName string    `json:"division_name"`
	CreatedAt    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt    time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func (d *Division) Prepare() {
	d.Name = html.EscapeString(strings.TrimSpace(d.Name))
	d.DivisionName = html.EscapeString(strings.TrimSpace(d.DivisionName))
	d.CreatedAt = time.Now()
	d.UpdatedAt = time.Now()
}

func (d *Division) SaveDivision(db *gorm.DB) (*Division, error) {
	var err error
	err = db.Debug().Model(&Sheet{}).Create(&d).Error
	if err != nil {
		return &Division{}, err
	}
	return d, nil
}

package models

import (
	"time"

	"github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/jinzhu/gorm"
)

// LibrarySettings represents the library configuration stored in the database
type LibrarySettings struct {
	ID              uint      `gorm:"primary_key" json:"id"`
	LibraryPath     string    `gorm:"type:varchar(500)" json:"library_path"`
	AutoScanEnabled bool      `gorm:"default:false" json:"auto_scan_enabled"`
	ScanInterval    int       `gorm:"default:60" json:"scan_interval"` // minutes
	OrganizeMode    bool      `gorm:"default:false" json:"organize_mode"`
	AllowDuplicates bool      `gorm:"default:false" json:"allow_duplicates"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`
}

// GetSettings retrieves the current library settings from the database.
// If no settings exist, it creates a new record with default values.
func GetSettings(db *gorm.DB) (*LibrarySettings, error) {
	var settings LibrarySettings

	// Try to find existing settings
	err := db.First(&settings).Error
	if err != nil {
		if gorm.IsRecordNotFoundError(err) {
			// No settings exist, create with defaults
			settings = LibrarySettings{
				LibraryPath:     "",
				AutoScanEnabled: false,
				ScanInterval:    60,
				OrganizeMode:    false,
				AllowDuplicates: false,
			}
			err = db.Create(&settings).Error
			if err != nil {
				return nil, err
			}
			return &settings, nil
		}
		return nil, err
	}

	return &settings, nil
}

// SeedFromEnv initializes settings from environment variables on first run.
// This should only be called if the settings table is empty.
func SeedFromEnv(db *gorm.DB, cfg config.ServerConfig) error {
	var count int64
	db.Model(&LibrarySettings{}).Count(&count)

	// Only seed if table is empty
	if count > 0 {
		return nil
	}

	// Strip quotes from library path if present
	libraryPath := cfg.LibraryPath
	if len(libraryPath) >= 2 && libraryPath[0] == '"' && libraryPath[len(libraryPath)-1] == '"' {
		libraryPath = libraryPath[1 : len(libraryPath)-1]
	}
	if len(libraryPath) >= 2 && libraryPath[0] == '\'' && libraryPath[len(libraryPath)-1] == '\'' {
		libraryPath = libraryPath[1 : len(libraryPath)-1]
	}

	settings := LibrarySettings{
		LibraryPath:     libraryPath,
		AutoScanEnabled: cfg.AutoScanEnabled,
		ScanInterval:    cfg.ScanInterval,
		OrganizeMode:    cfg.OrganizeMode,
		AllowDuplicates: cfg.AllowDuplicates,
	}

	return db.Create(&settings).Error
}

// UpdateSettings updates the library settings in the database
func (s *LibrarySettings) UpdateSettings(db *gorm.DB) error {
	return db.Save(s).Error
}

// TableName specifies the table name for GORM
func (LibrarySettings) TableName() string {
	return "library_settings"
}

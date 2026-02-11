package sync

import (
	"fmt"
	"os"
	"path"
	"path/filepath"
	"sync"
	"time"

	"github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/SheetAble/SheetAble/backend/api/scanner"
	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/jinzhu/gorm"
)

// SyncStatus tracks the current sync operation status
type SyncStatus struct {
	IsScanning    bool
	LastScanTime  time.Time
	FilesFound    int
	FilesImported int
	FilesUpdated  int
	FilesMissing  int
	FilesSkipped  int
	Errors        []string
}

var (
	currentStatus SyncStatus
	statusMutex   sync.RWMutex
)

// GetStatus returns the current sync status (thread-safe)
func GetStatus() SyncStatus {
	statusMutex.RLock()
	defer statusMutex.RUnlock()
	return currentStatus
}

// SyncLibrary performs a full library sync (thread-safe)
func SyncLibrary(db *gorm.DB, libraryPath string) error {
	if libraryPath == "" {
		return fmt.Errorf("library path not configured")
	}

	// Check if sync is already in progress (with mutex protection)
	statusMutex.Lock()
	if currentStatus.IsScanning {
		statusMutex.Unlock()
		return fmt.Errorf("scan already in progress")
	}

	// Set scanning status
	currentStatus = SyncStatus{
		IsScanning:    true,
		FilesFound:    0,
		FilesImported: 0,
		FilesUpdated:  0,
		FilesMissing:  0,
		FilesSkipped:  0,
		Errors:        []string{},
	}
	statusMutex.Unlock()

	// Ensure we always mark scanning as complete
	defer func() {
		statusMutex.Lock()
		currentStatus.IsScanning = false
		currentStatus.LastScanTime = time.Now()
		statusMutex.Unlock()
	}()

	// Discover all PDF files
	files, err := scanner.DiscoverFiles(libraryPath)
	if err != nil {
		return err
	}

	// Update files found count
	statusMutex.Lock()
	currentStatus.FilesFound = len(files)
	statusMutex.Unlock()

	// Import each file
	for _, fileInfo := range files {
		updated, err := ImportFile(db, fileInfo)

		statusMutex.Lock()
		if err != nil {
			currentStatus.Errors = append(currentStatus.Errors, fmt.Sprintf("%s: %v", fileInfo.FileName, err))
			currentStatus.FilesSkipped++
		} else {
			if updated {
				currentStatus.FilesUpdated++
			} else {
				currentStatus.FilesImported++
			}
		}
		statusMutex.Unlock()
	}

	// Mark records as unavailable for files that no longer exist
	missingCount, err := MarkMissingFiles(db)
	if err != nil {
		statusMutex.Lock()
		currentStatus.Errors = append(currentStatus.Errors, fmt.Sprintf("Error marking missing files: %v", err))
		statusMutex.Unlock()
	} else {
		statusMutex.Lock()
		currentStatus.FilesMissing = missingCount
		statusMutex.Unlock()
	}

	return nil
}

// ImportFile imports a single file into the database (with transaction support)
// Returns (updated bool, error)
func ImportFile(db *gorm.DB, fileInfo scanner.FileInfo) (bool, error) {
	cfg := config.Config()

	// Start transaction
	tx := db.Begin()
	if tx.Error != nil {
		return false, tx.Error
	}

	// Ensure rollback on panic or error
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 1. Check if sheet already exists by safe name
	var existingSheet models.Sheet
	err := tx.Where("safe_sheet_name = ?", fileInfo.SafeTitle).First(&existingSheet).Error
	if err == nil {
		// Sheet exists, update if it's a synced file and something changed
		if existingSheet.Source == "synced" {
			needsUpdate := false
			hashChanged := false

			if existingSheet.FilePath != fileInfo.Path {
				needsUpdate = true
			}
			if existingSheet.FileHash != fileInfo.Hash {
				needsUpdate = true
				hashChanged = true
			}
			if !existingSheet.IsAvailable {
				needsUpdate = true
			}

			if needsUpdate {
				existingSheet.FilePath = fileInfo.Path
				existingSheet.FileHash = fileInfo.Hash
				existingSheet.IsAvailable = true
				existingSheet.UpdatedAt = time.Now()

				err := tx.Model(&existingSheet).Updates(map[string]interface{}{
					"file_path":    fileInfo.Path,
					"file_hash":    fileInfo.Hash,
					"is_available": true,
					"updated_at":   time.Now(),
				}).Error
				if err != nil {
					tx.Rollback()
					return false, err
				}

				// If hash changed, regenerate thumbnail
				if hashChanged {
					thumbErr := utils.GenerateThumbnailLocal(fileInfo.Path, existingSheet.SafeSheetName)
					if thumbErr != nil {
						fmt.Printf("Warning: Failed to regenerate thumbnail for %s: %v\n", existingSheet.SafeSheetName, thumbErr)
					}
				}

				// Redo symlink if organize mode is enabled
				if cfg.OrganizeMode {
					CreateSymlink(tx, &existingSheet)
				}

				return true, tx.Commit().Error
			}

			tx.Rollback()
			return false, nil // No update needed
		}
		tx.Rollback()
		// If it's an uploaded file, skip
		return false, fmt.Errorf("sheet already exists as uploaded file")
	}

	// 2. Check for duplicates by hash if not allowing duplicates (for new sheets only)
	if !cfg.AllowDuplicates && fileInfo.Hash != "" {
		existing, err := models.FindSheetByHash(tx, fileInfo.Hash)
		if err == nil && existing != nil {
			tx.Rollback()
			// Duplicate found, skip
			return false, fmt.Errorf("duplicate file (hash matches existing sheet: %s)", existing.SafeSheetName)
		}
	}

	// Create or get composer
	composer := models.Composer{
		Name:        fileInfo.Composer,
		SafeName:    fileInfo.SafeComposer,
		PortraitURL: "https://icon-library.com/images/unknown-person-icon/unknown-person-icon-4.jpg",
		Epoch:       "Unknown",
	}
	composer.Prepare()
	composer.SaveComposer(tx)

	// Create sheet entry
	sheet := models.Sheet{
		SafeSheetName:   fileInfo.SafeTitle,
		SheetName:       fileInfo.Title,
		SafeComposer:    fileInfo.SafeComposer,
		Composer:        fileInfo.Composer,
		ReleaseDate:     time.Now(),
		UploaderID:      1, // System user for synced files
		FilePath:        fileInfo.Path,
		FileHash:        fileInfo.Hash,
		IsAvailable:     true,
		Source:          "synced",
		InformationText: fmt.Sprintf("Synced from library: %s", filepath.Dir(fileInfo.Path)),
	}
	sheet.Prepare()

	_, err = sheet.SaveSheet(tx)
	if err != nil {
		tx.Rollback()
		return false, err
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return false, err
	}

	// Create symlink if organize mode is enabled (outside transaction)
	if cfg.OrganizeMode {
		err = CreateSymlink(db, &sheet)
		if err != nil {
			// Log error but don't fail the import
			fmt.Printf("Warning: Failed to create symlink for %s: %v\n", sheet.SafeSheetName, err)
		}
	}

	// Generate thumbnail (outside transaction) using local processing
	var thumbErr error
	symlinkPath := path.Join(cfg.ConfigPath, "sheets/uploaded-sheets", sheet.SafeComposer, sheet.SafeSheetName+".pdf")
	if cfg.OrganizeMode && fileExists(symlinkPath) {
		thumbErr = utils.GenerateThumbnailLocal(symlinkPath, sheet.SafeSheetName)
	} else {
		thumbErr = utils.GenerateThumbnailLocal(fileInfo.Path, sheet.SafeSheetName)
	}

	if thumbErr != nil {
		fmt.Printf("Warning: Failed to generate thumbnail for %s: %v\n", sheet.SafeSheetName, thumbErr)
	}

	return false, nil
}

// MarkMissingFiles marks sheets as unavailable if their source files no longer exist
func MarkMissingFiles(db *gorm.DB) (int, error) {
	var syncedSheets []models.Sheet
	// Check all currently available synced sheets
	err := db.Where("source = ? AND is_available = ?", "synced", true).Find(&syncedSheets).Error
	if err != nil {
		return 0, err
	}

	missingCount := 0
	for _, sheet := range syncedSheets {
		if sheet.FilePath != "" {
			if _, err := os.Stat(sheet.FilePath); os.IsNotExist(err) {
				// File is gone, mark as unavailable
				err := sheet.MarkAsUnavailable(db)
				if err != nil {
					fmt.Printf("Warning: Failed to mark missing sheet %s: %v\n", sheet.SafeSheetName, err)
					continue
				}
				missingCount++
			}
		}
	}

	return missingCount, nil
}

// CreateSymlink creates a symlink in the organized structure
func CreateSymlink(db *gorm.DB, sheet *models.Sheet) error {
	if sheet.FilePath == "" || sheet.Source != "synced" {
		return nil
	}

	cfg := config.Config()

	// Create target directory
	targetDir := path.Join(cfg.ConfigPath, "sheets/uploaded-sheets", sheet.SafeComposer)
	utils.CreateDir(targetDir)

	// Create symlink path
	symlinkPath := path.Join(targetDir, sheet.SafeSheetName+".pdf")

	// Remove existing symlink if it exists
	if _, err := os.Lstat(symlinkPath); err == nil {
		os.Remove(symlinkPath)
	}

	// Create symlink
	err := os.Symlink(sheet.FilePath, symlinkPath)
	if err != nil {
		return fmt.Errorf("failed to create symlink: %v", err)
	}

	return nil
}

// CleanupSymlinks removes all symlinks for synced files
func CleanupSymlinks(db *gorm.DB) error {
	var syncedSheets []models.Sheet
	err := db.Where("source = ?", "synced").Find(&syncedSheets).Error
	if err != nil {
		return err
	}

	cfg := config.Config()

	for _, sheet := range syncedSheets {
		symlinkPath := path.Join(cfg.ConfigPath, "sheets/uploaded-sheets", sheet.SafeComposer, sheet.SafeSheetName+".pdf")
		if _, err := os.Lstat(symlinkPath); err == nil {
			// Check if it's a symlink
			fileInfo, err := os.Lstat(symlinkPath)
			if err == nil && fileInfo.Mode()&os.ModeSymlink != 0 {
				os.Remove(symlinkPath)
			}
		}
	}

	return nil
}

// CreateAllSymlinks creates symlinks for all synced files
func CreateAllSymlinks(db *gorm.DB) error {
	var syncedSheets []models.Sheet
	err := db.Where("source = ? AND is_available = ?", "synced", true).Find(&syncedSheets).Error
	if err != nil {
		return err
	}

	for _, sheet := range syncedSheets {
		err := CreateSymlink(db, &sheet)
		if err != nil {
			fmt.Printf("Warning: Failed to create symlink for %s: %v\n", sheet.SafeSheetName, err)
		}
	}

	return nil
}

// fileExists checks if a file exists
func fileExists(path string) bool {
	_, err := os.Stat(path)
	return err == nil
}

package controllers

import (
	"fmt"
	"net/http"

	"github.com/SheetAble/SheetAble/backend/api/auth"
	"github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/SheetAble/SheetAble/backend/api/sync"
	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/gin-gonic/gin"
)

// TriggerLibraryScan manually triggers a library scan
func (server *Server) TriggerLibraryScan(c *gin.Context) {
	// Check for authentication
	token := utils.ExtractToken(c)
	uid, err := auth.ExtractTokenID(token, config.Config().ApiSecret)
	if err != nil || uid == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get library settings from database
	settings, err := models.GetSettings(server.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve settings"})
		return
	}

	if settings.LibraryPath == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Library path not configured"})
		return
	}

	// Start scan in background
	// Note: SyncLibrary now handles concurrent sync prevention internally
	go func() {
		err := sync.SyncLibrary(server.DB, settings.LibraryPath)
		if err != nil {
			// Log error but don't fail the request
			// The error will be in the status
			fmt.Printf("Library sync error: %v\n", err)
		}
	}()

	c.JSON(http.StatusAccepted, gin.H{
		"message": "Library scan started",
		"status":  sync.GetStatus(),
	})
}

// GetLibraryStatus returns the current scan status
func (server *Server) GetLibraryStatus(c *gin.Context) {
	status := sync.GetStatus()
	c.JSON(http.StatusOK, status)
}

// GetLibraryStats returns library statistics
func (server *Server) GetLibraryStats(c *gin.Context) {
	var totalSheets int64
	var uploadedSheets int64
	var syncedSheets int64
	var unavailableSheets int64
	var totalComposers int64

	server.DB.Model(&models.Sheet{}).Count(&totalSheets)
	server.DB.Model(&models.Sheet{}).Where("source = ?", "uploaded").Count(&uploadedSheets)
	server.DB.Model(&models.Sheet{}).Where("source = ?", "synced").Count(&syncedSheets)
	server.DB.Model(&models.Sheet{}).Where("is_available = ?", false).Count(&unavailableSheets)
	server.DB.Model(&models.Composer{}).Count(&totalComposers)

	status := sync.GetStatus()

	c.JSON(http.StatusOK, gin.H{
		"total_sheets":       totalSheets,
		"uploaded_sheets":    uploadedSheets,
		"synced_sheets":      syncedSheets,
		"unavailable_sheets": unavailableSheets,
		"total_composers":    totalComposers,
		"last_scan_time":     status.LastScanTime,
		"is_scanning":        status.IsScanning,
	})
}

// GetLibrarySettings returns current library settings from database
func (server *Server) GetLibrarySettings(c *gin.Context) {
	settings, err := models.GetSettings(server.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve settings"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"library_path":      settings.LibraryPath,
		"auto_scan_enabled": settings.AutoScanEnabled,
		"scan_interval":     settings.ScanInterval,
		"organize_mode":     settings.OrganizeMode,
		"allow_duplicates":  settings.AllowDuplicates,
	})
}

// UpdateLibrarySettings updates library settings in the database
func (server *Server) UpdateLibrarySettings(c *gin.Context) {
	// Check for authentication
	token := utils.ExtractToken(c)
	uid, err := auth.ExtractTokenID(token, config.Config().ApiSecret)
	if err != nil || uid == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Check if user is admin (uid == 1)
	var user models.User
	err = server.DB.Model(&models.User{}).Where("id = ?", uid).First(&user).Error
	if err != nil || user.ID != 1 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
		return
	}

	// Get current settings
	settings, err := models.GetSettings(server.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve settings"})
		return
	}

	// Store previous values for comparison
	previousAutoScan := settings.AutoScanEnabled
	previousInterval := settings.ScanInterval
	previousLibraryPath := settings.LibraryPath
	previousOrganizeMode := settings.OrganizeMode

	// Parse request body
	var requestBody struct {
		LibraryPath     *string `json:"library_path"`
		AutoScanEnabled *bool   `json:"auto_scan_enabled"`
		ScanInterval    *int    `json:"scan_interval"`
		OrganizeMode    *bool   `json:"organize_mode"`
		AllowDuplicates *bool   `json:"allow_duplicates"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Update settings
	if requestBody.LibraryPath != nil {
		settings.LibraryPath = *requestBody.LibraryPath
	}
	if requestBody.AutoScanEnabled != nil {
		settings.AutoScanEnabled = *requestBody.AutoScanEnabled
	}
	if requestBody.ScanInterval != nil {
		settings.ScanInterval = *requestBody.ScanInterval
	}
	if requestBody.OrganizeMode != nil {
		settings.OrganizeMode = *requestBody.OrganizeMode
	}
	if requestBody.AllowDuplicates != nil {
		settings.AllowDuplicates = *requestBody.AllowDuplicates
	}

	// Save to database
	err = settings.UpdateSettings(server.DB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update settings"})
		return
	}

	// Handle organize mode changes
	if requestBody.OrganizeMode != nil {
		if settings.OrganizeMode && !previousOrganizeMode {
			// Organize mode enabled - create symlinks
			go func() {
				err := sync.CreateAllSymlinks(server.DB)
				if err != nil {
					// Log error
				}
			}()
		} else if !settings.OrganizeMode && previousOrganizeMode {
			// Organize mode disabled - cleanup symlinks
			go func() {
				err := sync.CleanupSymlinks(server.DB)
				if err != nil {
					// Log error
				}
			}()
		}
	}

	// Restart scheduler if auto-scan settings changed
	autoScanChanged := (requestBody.AutoScanEnabled != nil && settings.AutoScanEnabled != previousAutoScan)
	intervalChanged := (requestBody.ScanInterval != nil && settings.ScanInterval != previousInterval)
	pathChanged := (requestBody.LibraryPath != nil && settings.LibraryPath != previousLibraryPath)

	if autoScanChanged || intervalChanged || pathChanged {
		// Stop existing scheduler
		sync.StopScheduler()

		// Start new scheduler if enabled
		if settings.AutoScanEnabled && settings.LibraryPath != "" {
			go sync.StartScheduler(server.DB, settings.LibraryPath, settings.ScanInterval)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message":           "Settings updated successfully",
		"library_path":      settings.LibraryPath,
		"auto_scan_enabled": settings.AutoScanEnabled,
		"scan_interval":     settings.ScanInterval,
		"organize_mode":     settings.OrganizeMode,
		"allow_duplicates":  settings.AllowDuplicates,
	})
}

// GetThumbnailTools returns information about available thumbnail generation tools
func (server *Server) GetThumbnailTools(c *gin.Context) {
	tools := utils.CheckThumbnailTools()
	recommended := utils.GetRecommendedThumbnailMethod()

	c.JSON(http.StatusOK, gin.H{
		"available_tools": tools,
		"recommended":     recommended,
		"status":          getToolStatus(tools),
	})
}

func getToolStatus(tools map[string]bool) string {
	if tools["pdftoppm"] {
		return "optimal"
	}
	if tools["convert"] {
		return "fallback"
	}
	return "none"
}

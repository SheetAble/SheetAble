package sync

import (
	"fmt"
	"time"

	"github.com/jinzhu/gorm"
)

var (
	ticker    *time.Ticker
	stopChan  chan bool
	isRunning bool
)

// StartScheduler starts the background sync scheduler
func StartScheduler(db *gorm.DB, libraryPath string, intervalMinutes int) {
	if isRunning {
		fmt.Println("Scheduler is already running")
		return
	}

	if libraryPath == "" {
		fmt.Println("Library path not configured, scheduler not started")
		return
	}

	if intervalMinutes <= 0 {
		intervalMinutes = 60 // Default to 60 minutes
	}

	isRunning = true
	stopChan = make(chan bool)
	ticker = time.NewTicker(time.Duration(intervalMinutes) * time.Minute)

	go func() {
		fmt.Printf("Library sync scheduler started (interval: %d minutes)\n", intervalMinutes)

		for {
			select {
			case <-ticker.C:
				fmt.Println("Running scheduled library sync...")
				err := SyncLibrary(db, libraryPath)
				if err != nil {
					fmt.Printf("Scheduled sync error: %v\n", err)
				} else {
					status := GetStatus()
					fmt.Printf("Scheduled sync completed: %d files found, %d imported, %d updated, %d missing, %d skipped\n",
						status.FilesFound, status.FilesImported, status.FilesUpdated, status.FilesMissing, status.FilesSkipped)
				}
			case <-stopChan:
				fmt.Println("Stopping library sync scheduler")
				ticker.Stop()
				isRunning = false
				return
			}
		}
	}()
}

// StopScheduler stops the background sync scheduler
func StopScheduler() {
	if !isRunning {
		return
	}

	if stopChan != nil {
		stopChan <- true
	}
}

// IsRunning returns whether the scheduler is currently running
func IsRunning() bool {
	return isRunning
}

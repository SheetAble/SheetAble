package seed

import (
	"fmt"
	"log"

	"github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/jinzhu/gorm"
)

func Load(db *gorm.DB, email string, password string) {
	err := db.AutoMigrate(&models.User{}, &models.Sheet{}, &models.Composer{}, &models.LibrarySettings{}).Error
	if err != nil {
		log.Fatalf("cannot migrate table: %v", err)
	}

	// Create admin user with explicit ID 1 and Role 0 (Admin)
	var admin models.User
	if err := db.Where("email = ?", email).First(&admin).Error; err != nil {
		if gorm.IsRecordNotFoundError(err) {
			admin = models.User{
				ID:       1,
				Email:    email,
				Password: password,
				Role:     0,
			}
			if err := db.Create(&admin).Error; err != nil {
				fmt.Printf("Error creating admin user: %v\n", err)
			} else {
				fmt.Println("Admin user created successfully")
			}
		}
	} else {
		// Ensure existing user has correct role if they are the designated admin
		if admin.Role != 0 {
			db.Model(&admin).Update("role", 0)
		}
	}

	// Seed library settings from environment variables
	cfg := config.Config()
	err = models.SeedFromEnv(db, cfg)
	if err != nil {
		fmt.Printf("Error seeding library settings: %v\n", err)
	} else {
		fmt.Println("Library settings initialized from environment variables")
	}
}

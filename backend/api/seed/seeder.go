package seed

import (
	"fmt"
	"log"

	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/jinzhu/gorm"
)

func Load(db *gorm.DB, email string, password string) {
	err := db.AutoMigrate(&models.User{}, &models.Sheet{}, &models.Composer{}).Error
	if err != nil {
		log.Fatalf("cannot migrate table: %v", err)
	}

	err = db.Model(&models.User{}).Create(&models.User{
		Email:    email,
		Password: password,
	}).Error

	if err != nil {
		fmt.Println("User already exists")
		return
	}
}

package seed

import (
	"fmt"
	"log"

	"github.com/jinzhu/gorm"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/models"
)

func Load(db *gorm.DB, email string, password string) {

	/*
		err := db.Debug().DropTableIfExists(&models.Post{}, &models.User{}, &models.Division{}).Error
		if err != nil {
			log.Fatalf("cannot drop table: %v", err)
		}

	*/

	err := db.Debug().AutoMigrate(&models.User{}, &models.Sheet{}, &models.Division{}, &models.Composer{}).Error
	if err != nil {
		log.Fatalf("cannot migrate table: %v", err)
	}

	err = db.Debug().Model(&models.User{}).Create(&models.User{
		Nickname: email,
		Email:    email,
		Password: password,
	}).Error

	if err != nil {
		fmt.Println("User already exists")
		return
	}
}

package api

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/controllers"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/seed"
)

var server = controllers.Server{}

func Run() {

	checkEnvs()

	var err error
	err = godotenv.Load()
	if err != nil {
		fmt.Println("Error getting env, not comming through, using sqlite instead")
	} else {
		fmt.Println("Env values loaded...")
	}

	server.Initialize(os.Getenv("DB_DRIVER"), os.Getenv("DB_USER"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_PORT"), os.Getenv("DB_HOST"), os.Getenv("DB_NAME"))

	seed.Load(server.DB, os.Getenv("ADMIN_EMAIL"), os.Getenv("ADMIN_PASSWORD"))

	server.Run("0.0.0.0:8080")

}

func checkEnvs() {
	/*
		Check admin login data and api secret, so if there is none the default will be set
		default:
			email: admin
			password: sheetable
			API_SECRET: sheetable
	*/

	godotenv.Load()

	if os.Getenv("ADMIN_EMAIL") == "" {
		os.Setenv("ADMIN_EMAIL", "admin@admin.com")
	}
	if os.Getenv("ADMIN_PASSWORD") == "" {
		os.Setenv("ADMIN_PASSWORD", "sheetable")
	}
	if os.Getenv("API_SECRET") == "" {
		os.Setenv("API_SECRET", "sheetable")
	}
}

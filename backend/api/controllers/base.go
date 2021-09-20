package controllers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/config"
	"log"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/jinzhu/gorm"
	"github.com/rs/cors"

	"github.com/gorilla/handlers"
	_ "github.com/jinzhu/gorm/dialects/mysql"    //mysql database driver
	_ "github.com/jinzhu/gorm/dialects/postgres" //postgres database driver
	_ "github.com/jinzhu/gorm/dialects/sqlite"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/models"
)

type Server struct {
	DB     *gorm.DB
	Router *gin.Engine
	Config config.Config
}

func (server *Server) Initialize() {

	var err error

	DbDriver := server.Config.Database.Driver
	DbUser := server.Config.Database.User
	DbPassword := server.Config.Database.Password
	DbHost := server.Config.Database.Host
	DbPort := server.Config.Database.Port
	DbName := server.Config.Database.Name

	switch DbDriver {
	case "mysql":
		DBURL := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local", DbUser, DbPassword, DbHost, DbPort, DbName)
		server.DB, err = gorm.Open(DbDriver, DBURL)
		if err != nil {
			log.Fatalf("error conencting to %s database: %s", DbDriver, err.Error())
		} else {
			fmt.Printf("Connected to %s database...", DbDriver)
		}
	case "postgres":
		DBURL := fmt.Sprintf("host=%s port=%s user=%s dbname=%s sslmode=disable password=%s", DbHost, DbPort, DbUser, DbName, DbPassword)
		server.DB, err = gorm.Open(DbDriver, DBURL)
		if err != nil {
			log.Fatalf("error conencting to %s database: %s", DbDriver, err.Error())
		} else {
			fmt.Printf("Connected to %s database...", DbDriver)
		}
	default:
		if _, err := os.Stat(server.Config.ConfigPath); os.IsNotExist(err) {
			_ = os.Mkdir(server.Config.ConfigPath, os.ModePerm)
		}

		server.DB, err = gorm.Open("sqlite3", path.Join(server.Config.ConfigPath, "database.db"))

		if err != nil {
			log.Fatalf("error conencting to %s database: %s", DbDriver, err.Error())
		} else {
			fmt.Printf("Connected to %s database %s...", DbDriver, path.Join(server.Config.ConfigPath, "database.db"))
		}
	}

	/* Silence the logger */
	server.DB.LogMode(false)

	server.DB.AutoMigrate(&models.User{}, &models.Sheet{}) //database migration

	server.SetupRouter()
}

func (server *Server) Run(addr string, dev bool) {
	fmt.Printf("Listening to port %v\n", addr)
	// cors.Default() setup the middleware with default options being
	// all origins accepted with simple methods (GET, POST). See
	// documentation below for more options.

	c := cors.New(cors.Options{
		// Enable Debugging for testing, consider disabling in production
		AllowedHeaders: []string{
			"Origin",
			"X-Requested-With",
			"Content-Type",
			"Accept",
			"Authorization",
		},
		AllowedMethods: []string{
			http.MethodHead,
			http.MethodGet,
			http.MethodPost,
			http.MethodPut,
			http.MethodPatch,
			http.MethodDelete,
		},
		AllowCredentials: true,
	})

	srvHandler := handlers.LoggingHandler(os.Stdout, server.Router)

	if dev {
		srvHandler = handlers.LoggingHandler(os.Stdout, c.Handler(server.Router))
	}

	srv := &http.Server{
		Handler: srvHandler,
		Addr:    addr,
		// Good practice: enforce timeouts for servers you create!
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Fatal(srv.ListenAndServe())
}

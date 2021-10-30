package controllers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"time"

	. "github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/gin-gonic/gin"

	"github.com/jinzhu/gorm"
	"github.com/rs/cors"

	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/gorilla/handlers"
	_ "github.com/jinzhu/gorm/dialects/mysql"    // mysql database driver
	_ "github.com/jinzhu/gorm/dialects/postgres" // postgres database driver
	_ "github.com/jinzhu/gorm/dialects/sqlite"
)

type Server struct {
	DB     *gorm.DB
	Router *gin.Engine
}

func (server *Server) Initialize() {

	var err error

	// Set Release Mode
	if !Config().Dev {
		gin.SetMode(gin.ReleaseMode)
	}

	DbDriver := Config().Database.Driver
	DbUser := Config().Database.User
	DbPassword := Config().Database.Password
	DbHost := Config().Database.Host
	DbPort := Config().Database.Port
	DbName := Config().Database.Name

	switch DbDriver {
	case "mysql":
		DBURL := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8&parseTime=True&loc=Local", DbUser, DbPassword, DbHost, DbPort, DbName)
		server.DB, err = gorm.Open(DbDriver, DBURL)
		if err != nil {
			log.Fatalf("error conencting to %s database: %s", DbDriver, err.Error())
		} else {
			fmt.Printf("Connected to %s database...\n", DbDriver)
		}
	case "postgres":
		DBURL := fmt.Sprintf("host=%s port=%d user=%s dbname=%s sslmode=disable password=%s", DbHost, DbPort, DbUser, DbName, DbPassword)
		server.DB, err = gorm.Open(DbDriver, DBURL)
		if err != nil {
			log.Fatalf("error conencting to %s database: %s", DbDriver, err.Error())
		} else {
			fmt.Printf("Connected to %s database...\n", DbDriver)
		}
	default:
		if _, err := os.Stat(Config().ConfigPath); os.IsNotExist(err) {
			_ = os.Mkdir(Config().ConfigPath, os.ModePerm)
		}

		server.DB, err = gorm.Open("sqlite3", path.Join(Config().ConfigPath, "database.db"))

		if err != nil {
			log.Fatalf("error conencting to %s database: %s", DbDriver, err.Error())
		} else {
			fmt.Printf("Connected to %s database %s...\n", DbDriver, path.Join(Config().ConfigPath, "database.db"))
		}
	}

	// Silence the logger
	server.DB.LogMode(false)

	// Migrate DBs
	server.DB.AutoMigrate(&models.User{}, &models.Sheet{})

	server.SetupRouter()
}

func (server *Server) Run(addr string, dev bool) {
	fmt.Printf("Listening to port %v\n", addr)
	/* 
		cors.Default() setup the middleware with default options being
		all origins accepted with simple methods (GET, POST).
		See documentation below for more options.
	*/
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

	// Check if run in dev mode, so you can enable CORS or not 
	srvHandler := handlers.LoggingHandler(os.Stdout, c.Handler(server.Router))

	if !dev {
		srvHandler = handlers.LoggingHandler(os.Stdout, server.Router)
	}

	srv := &http.Server{
		Handler:      srvHandler,
		Addr:         addr,
		WriteTimeout: 15 * time.Second,
		ReadTimeout:  15 * time.Second,
	}

	log.Fatal(srv.ListenAndServe())
}

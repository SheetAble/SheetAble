package controllers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
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
	Router *mux.Router
}

func (server *Server) Initialize(Dbdriver, DbUser, DbPassword, DbPort, DbHost, DbName string) {

	var err error

	if Dbdriver == "mysql" {
		DBURL := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8&parseTime=True&loc=Local", DbUser, DbPassword, DbHost, DbPort, DbName)
		server.DB, err = gorm.Open(Dbdriver, DBURL)
		if err != nil {
			fmt.Printf("Cannot connect to %s database", Dbdriver)
			log.Fatal("This is the error:", err)
		} else {
			fmt.Printf("Connected to %s database...", Dbdriver)
		}
	}
	if Dbdriver == "postgres" {
		DBURL := fmt.Sprintf("host=%s port=%s user=%s dbname=%s sslmode=disable password=%s", DbHost, DbPort, DbUser, DbName, DbPassword)
		server.DB, err = gorm.Open(Dbdriver, DBURL)
		if err != nil {
			fmt.Printf("Cannot connect to %s database", Dbdriver)
			log.Fatal("This is the error:", err)
		} else {
			fmt.Printf("Connected to %s database...", Dbdriver)
		}
	}
	if Dbdriver == "sqlite" || Dbdriver == "" {
		if _, err := os.Stat(os.Getenv("CONFIG_PATH")); os.IsNotExist(err) {
			_ = os.Mkdir(os.Getenv("CONFIG_PATH"), os.ModePerm)
		}

		server.DB, err = gorm.Open("sqlite3", os.Getenv("CONFIG_PATH")+"database.db")

		if err != nil {
			fmt.Printf("Cannot connect to %s database", Dbdriver)
			log.Fatal("This is the error:", err)
		} else {
			fmt.Printf("Connected to %s database...", Dbdriver)
		}
	}

	server.DB.Debug().AutoMigrate(&models.User{}, &models.Sheet{}) //database migration

	server.Router = mux.NewRouter()

	server.initializeRoutes()
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
	//fmt.Println(addr, c)
	//handler := c.Handler(server.Router)
	//log.Fatal(http.ListenAndServe(addr, handler))
}

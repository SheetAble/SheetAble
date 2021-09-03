package controllers

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/jinzhu/gorm"

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

		if _, err := os.Stat("config/database.db"); os.IsNotExist(err) {
			os.Create("config/database.db") // Create database.db file
		}

		server.DB, err = gorm.Open("sqlite3", "config/database.db")

		if err != nil {
			fmt.Printf("Cannot connect to %s database", Dbdriver)
			log.Fatal("This is the error:", err)
		} else {
			fmt.Printf("Connected to %s database...", Dbdriver)
		}
	}

	server.DB.Debug().AutoMigrate(&models.User{}, &models.Post{}) //database migration

	server.Router = mux.NewRouter()

	server.initializeRoutes()
}

func (server *Server) Run(addr string) {
	fmt.Printf("Listening to port %v\n", addr)
	// cors.Default() setup the middleware with default options being
	// all origins accepted with simple methods (GET, POST). See
	// documentation below for more options.

	/*c := cors.New(cors.Options{
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
	*/

	srv := &http.Server{
		Handler: handlers.LoggingHandler(os.Stdout, server.Router),
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

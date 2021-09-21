package controllers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"path"
	"time"

	rice "github.com/GeertJohan/go.rice"
)

func (s *Server) SetupRouter() {
	r := gin.Default()

	// health checks
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
	})

	// TODO(jj) - add auth middleware for some routes

	api := r.Group("/api")

	// Login routes
	api.POST("/login", s.Login)

	// Users routes
	api.POST("/users", s.CreateUser)
	api.GET("/users", s.GetUsers)
	api.GET("/users/:id", s.GetUser)
	api.PUT("/users/:id", s.UpdateUser)
	api.DELETE("/users/:id", s.DeleteUser)

	// Sheet routes
	api.POST("/upload", s.UploadFile)
	api.GET("/sheets", s.GetSheetsPage)
	api.POST("/sheets", s.GetSheetsPage)

	// Serve React
	appBox := rice.MustFindBox("../../../frontend/build")

	//r.StaticFS("/static", appBox.HTTPBox())
	r.GET("/static/*filepath", func(c *gin.Context) {
		filepath := c.Request.URL.String()
		file, err := appBox.Open(filepath)
		if err != nil {
			c.String(http.StatusBadRequest, err.Error())
			return
		}
		http.ServeContent(c.Writer, c.Request, path.Base(filepath), time.Time{}, file)

	})
	r.NoRoute(gin.WrapF(serveAppHandler(appBox)))

	s.Router = r
}

//func (s *Server) initializeRoutes() {
//
//	api := s.Router.PathPrefix("/api/").Subrouter()
//
//	// Login Route
//	api.HandleFunc("/login", middlewares.SetMiddlewareJSON(s.Login)).Methods("POST", http.MethodOptions)
//
//	// Users routes
//	api.HandleFunc("/users", middlewares.SetMiddlewareJSON(s.CreateUser)).Methods("POST")
//	api.HandleFunc("/users", middlewares.SetMiddlewareJSON(s.GetUsers)).Methods("GET")
//	api.HandleFunc("/users/{id}", middlewares.SetMiddlewareJSON(s.GetUser)).Methods("GET") // If ID == 0 you will get own user
//	api.HandleFunc("/users/{id}", middlewares.SetMiddlewareJSON(middlewares.SetMiddlewareAuthentication(s.UpdateUser))).Methods("PUT")
//	api.HandleFunc("/users/{id}", middlewares.SetMiddlewareAuthentication(s.DeleteUser)).Methods("DELETE")
//
//	// Sheet routes
//	api.HandleFunc("/upload", middlewares.SetMiddlewareAuthentication(s.UploadFile)).Methods("POST")
//	api.HandleFunc("/sheets", middlewares.SetMiddlewareAuthentication(s.GetSheetsPage)).Methods("GET", "POST")
//	api.HandleFunc("/sheet/thumbnail/{name}", s.GetThumbnail).Methods("GET")
//	api.HandleFunc("/sheet/pdf/{composer}/{sheetName}", middlewares.SetMiddlewareAuthentication(s.GetPDF)).Methods("GET")
//	api.HandleFunc("/sheet/{sheetName}", middlewares.SetMiddlewareAuthentication(s.GetSheet)).Methods("GET")
//	api.HandleFunc("/sheet/{sheetName}", middlewares.SetMiddlewareAuthentication(s.UpdateSheet)).Methods("PUT")
//	api.HandleFunc("/sheet/{sheetName}", middlewares.SetMiddlewareAuthentication(s.DeletSheet)).Methods("DELETE")
//
//	// Composer routes
//	api.HandleFunc("/composers", middlewares.SetMiddlewareAuthentication(s.GetComposersPage)).Methods("GET", "POST")
//	api.HandleFunc("/composer/{composerName}", middlewares.SetMiddlewareAuthentication(s.UpdateComposer)).Methods("PUT")
//	api.HandleFunc("/composer/{composerName}", middlewares.SetMiddlewareAuthentication(s.DeleteComposer)).Methods("DELETE")
//	api.HandleFunc("/composer/portrait/{composerName}", s.ServePortraits).Methods("GET")
//
//	// Serve React
//	appBox, err := rice.FindBox("../../../frontend/build")
//	if err != nil {
//		log.Fatal(err)
//	}
//
//	s.Router.PathPrefix("/static/").Handler(http.FileServer(appBox.HTTPBox()))
//	s.Router.PathPrefix("/").HandlerFunc(serveAppHandler(appBox))
//}

func serveAppHandler(app *rice.Box) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		indexFile, err := app.Open("index.html")
		if err != nil {
			http.Error(w, "Internal Server Error", http.StatusInternalServerError)
			return
		}
		http.ServeContent(w, r, "index.html", time.Time{}, indexFile)
	}
}

package controllers

import (
	"github.com/gin-gonic/gin"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/middlewares"
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

	api := r.Group("/api")

	// secureApi is still rooted at /api/... but it has the auth middleware so it's routes check token on each call
	secureApi := api.Group("")
	secureApi.Use(middlewares.AuthMiddleware())

	// Login routes
	api.POST("/login", s.Login)

	// Users routes
	api.POST("/users", s.CreateUser)
	api.GET("/users", s.GetUsers)
	api.GET("/users/:id", s.GetUser)
	secureApi.PUT("/users/:id", s.UpdateUser)
	secureApi.DELETE("/users/:id", s.DeleteUser)

	// Sheet routes
	secureApi.POST("/upload", s.UploadFile)
	secureApi.GET("/sheets", s.GetSheetsPage)
	secureApi.POST("/sheets", s.GetSheetsPage)
	api.GET("/sheet/thumbnail/:name", s.GetThumbnail)
	secureApi.GET("/sheet/pdf/:composer/:sheetName", s.GetPDF)
	secureApi.GET("/sheet/:sheetName", s.GetSheet)
	secureApi.PUT("/sheet/:sheetName", s.UpdateSheet)
	secureApi.DELETE("/sheet/:sheetName", s.DeleteSheet)


	// Composer routes
	secureApi.GET("/composers", s.GetComposersPage)
	secureApi.POST("/composers", s.GetComposersPage)
	secureApi.PUT("/composers/:composerName", s.UpdateComposer)
	secureApi.DELETE("/composer/:composerName", s.DeleteComposer)
	api.GET("/composer/portrait/:composerName", s.ServePortraits)

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

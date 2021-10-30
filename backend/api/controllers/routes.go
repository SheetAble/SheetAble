package controllers

import (
	"net/http"
	"path"
	"time"

	"github.com/SheetAble/SheetAble/backend/api/middlewares"
	"github.com/gin-gonic/gin"

	rice "github.com/GeertJohan/go.rice"
)

func (server *Server) SetupRouter() {
	r := gin.New()
	r.Use(gin.Recovery())

	// health checks
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "OK"})
	})

	api := r.Group("/api")

	api.GET("", server.Home)

	// secureApi is still rooted at /api/... but it has the auth middleware so it'server routes check token on each call
	secureApi := api.Group("")
	secureApi.Use(middlewares.AuthMiddleware())

	// Login routes
	api.POST("/login", server.Login)

	// Users routes
	api.POST("/users", server.CreateUser)
	api.GET("/users", server.GetUsers)
	api.GET("/users/:id", server.GetUser)
	secureApi.PUT("/users/:id", server.UpdateUser)
	secureApi.DELETE("/users/:id", server.DeleteUser)

	// Sheet routes
	secureApi.POST("/upload", server.UploadFile)
	secureApi.GET("/sheets", server.GetSheetsPage)
	secureApi.POST("/sheets", server.GetSheetsPage)
	api.GET("/sheet/thumbnail/:name", server.GetThumbnail)
	secureApi.GET("/sheet/pdf/:composer/:sheetName", server.GetPDF)
	secureApi.GET("/sheet/:sheetName", server.GetSheet)
	secureApi.PUT("/sheet/:sheetName", server.UpdateSheet)
	secureApi.DELETE("/sheet/:sheetName", server.DeleteSheet)
	secureApi.GET("/search/:searchValue", server.Search)
	secureApi.PUT("/sheet/:sheetName/info", server.UpdateSheetInformationText)

	// Sheet tag routes
	secureApi.DELETE("/tag/sheet/:sheetName", server.DeleteTag)
	secureApi.POST("/tag/delete/sheet/:sheetName", server.DeleteTag) // Because of frontend issues
	secureApi.POST("/tag/sheet/:sheetName", server.AppendTag)
	secureApi.GET("/tag/sheet/:sheetName", server.AppendTag) // Because of frontend issues

	// Composer routes
	secureApi.GET("/composers", server.GetComposersPage)
	secureApi.POST("/composers", server.GetComposersPage)
	secureApi.PUT("/composers/:composerName", server.UpdateComposer)
	secureApi.DELETE("/composer/:composerName", server.DeleteComposer)
	api.GET("/composer/portrait/:composerName", server.ServePortraits)

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

	server.Router = r
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

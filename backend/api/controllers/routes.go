package controllers

import (
	"log"
	"net/http"
	"time"

	rice "github.com/GeertJohan/go.rice"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/middlewares"
)

func (s *Server) initializeRoutes() {

	api := s.Router.PathPrefix("/api/").Subrouter()

	// Login Route
	api.HandleFunc("/login", middlewares.SetMiddlewareJSON(s.Login)).Methods("POST", http.MethodOptions)

	// Users routes
	api.HandleFunc("/users", middlewares.SetMiddlewareJSON(s.CreateUser)).Methods("POST")
	api.HandleFunc("/users", middlewares.SetMiddlewareJSON(s.GetUsers)).Methods("GET")
	api.HandleFunc("/users/{id}", middlewares.SetMiddlewareJSON(s.GetUser)).Methods("GET") // If ID == 0 you will get own user
	api.HandleFunc("/users/{id}", middlewares.SetMiddlewareJSON(middlewares.SetMiddlewareAuthentication(s.UpdateUser))).Methods("PUT")
	api.HandleFunc("/users/{id}", middlewares.SetMiddlewareAuthentication(s.DeleteUser)).Methods("DELETE")

	// Sheet routes
	api.HandleFunc("/upload", middlewares.SetMiddlewareAuthentication(s.UploadFile)).Methods("POST")
	api.HandleFunc("/sheets", middlewares.SetMiddlewareAuthentication(s.GetSheetsPage)).Methods("GET", "POST")
	api.HandleFunc("/sheet/thumbnail/{name}", s.GetThumbnail).Methods("GET")
	api.HandleFunc("/sheet/pdf/{composer}/{sheetName}", middlewares.SetMiddlewareAuthentication(s.GetPDF)).Methods("GET")
	api.HandleFunc("/sheet/{sheetName}", middlewares.SetMiddlewareAuthentication(s.GetSheet)).Methods("GET")
	api.HandleFunc("/sheet/{sheetName}", middlewares.SetMiddlewareAuthentication(s.UpdateSheet)).Methods("PUT")
	api.HandleFunc("/sheet/{sheetName}", middlewares.SetMiddlewareAuthentication(s.DeletSheet)).Methods("DELETE")

	// Composer routes
	api.HandleFunc("/composers", middlewares.SetMiddlewareAuthentication(s.GetComposersPage)).Methods("GET", "POST")
	api.HandleFunc("/composer/{composerName}", middlewares.SetMiddlewareAuthentication(s.UpdateComposer)).Methods("PUT")

	// Serve React
	appBox, err := rice.FindBox("../../../frontend/build")
	if err != nil {
		log.Fatal(err)
	}

	s.Router.PathPrefix("/static/").Handler(http.FileServer(appBox.HTTPBox()))
	s.Router.PathPrefix("/").HandlerFunc(serveAppHandler(appBox))
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

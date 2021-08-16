package controllers

import (
	"net/http"

	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/middlewares"
)

func (s *Server) initializeRoutes() {
	// Home Route
	s.Router.HandleFunc("/", middlewares.SetMiddlewareJSON(s.Home)).Methods("GET")

	// Login Route
	s.Router.HandleFunc("/login", middlewares.SetMiddlewareJSON(s.Login)).Methods("POST", http.MethodOptions)

	// Users routes
	s.Router.HandleFunc("/users", middlewares.SetMiddlewareJSON(s.CreateUser)).Methods("POST")
	s.Router.HandleFunc("/users", middlewares.SetMiddlewareJSON(s.GetUsers)).Methods("GET")
	s.Router.HandleFunc("/users/{id}", middlewares.SetMiddlewareJSON(s.GetUser)).Methods("GET")
	s.Router.HandleFunc("/users/{id}", middlewares.SetMiddlewareJSON(middlewares.SetMiddlewareAuthentication(s.UpdateUser))).Methods("PUT")
	s.Router.HandleFunc("/users/{id}", middlewares.SetMiddlewareAuthentication(s.DeleteUser)).Methods("DELETE")

	// Posts routes
	s.Router.HandleFunc("/posts", middlewares.SetMiddlewareJSON(s.CreatePost)).Methods("POST")
	s.Router.HandleFunc("/posts", middlewares.SetMiddlewareJSON(s.GetPosts)).Methods("GET")
	s.Router.HandleFunc("/posts/{id}", middlewares.SetMiddlewareJSON(s.GetPost)).Methods("GET")
	s.Router.HandleFunc("/posts/{id}", middlewares.SetMiddlewareJSON(middlewares.SetMiddlewareAuthentication(s.UpdatePost))).Methods("PUT")
	s.Router.HandleFunc("/posts/{id}", middlewares.SetMiddlewareAuthentication(s.DeletePost)).Methods("DELETE")

	// Sheet routes
	s.Router.HandleFunc("/upload", middlewares.SetMiddlewareAuthentication(s.UploadFile)).Methods("POST")
	s.Router.HandleFunc("/sheets", middlewares.SetMiddlewareAuthentication(s.GetSheetsPost)).Methods("GET", "POST")

	s.Router.HandleFunc("/sheet/thumbnail/{name}", s.GetThumbnail).Methods("GET")
	s.Router.HandleFunc("/sheet/pdf/{composer}/{sheetName}", middlewares.SetMiddlewareAuthentication(s.GetPDF)).Methods("GET")
	s.Router.HandleFunc("/composers", middlewares.SetMiddlewareAuthentication(s.GetComposers)).Methods("GET")
	s.Router.HandleFunc("/sheet/{sheetName}", middlewares.SetMiddlewareAuthentication(s.GetSheet)).Methods("GET")
}

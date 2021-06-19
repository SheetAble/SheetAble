package controllers

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/models"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/responses"
)

func (server *Server) GetSheets(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// This endpoint will return max 20 sheets
	sheet := models.Sheet{}

	sheets, err := sheet.GetAllSheets(server.DB)
	if err != nil {
		responses.ERROR(w, http.StatusInternalServerError, err)
		return
	}
	fmt.Println(sheets)
	responses.JSON(w, http.StatusOK, sheets)
}

func (server *Server) GetThumbnail(w http.ResponseWriter, r *http.Request) {
	// Serve the thumbnail file
	name := mux.Vars(r)["name"]
	fmt.Println(name)
	http.ServeFile(w, r, "thumbnails/"+name+".png")
}

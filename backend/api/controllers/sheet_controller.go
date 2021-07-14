package controllers

import (
	"errors"
	"net/http"
	"net/url"

	"github.com/gorilla/mux"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/models"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/responses"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/utils"
)

func (server *Server) GetSheets(w http.ResponseWriter, r *http.Request) {
	/*
		This endpoint will return max 20 sheets
	*/

	sheet := models.Sheet{}

	sheets, err := sheet.GetAllSheets(server.DB)
	if err != nil {
		responses.ERROR(w, http.StatusInternalServerError, err)
		return
	}
	responses.JSON(w, http.StatusOK, sheets)
}

func (server *Server) GetSheet(w http.ResponseWriter, r *http.Request) {
	/*
		Get PDF file and information about an individual sheet.
		Example request: /sheet/Your%20SheetName
	*/

	vars := mux.Vars(r)
	sheetName, err := url.Parse(vars["sheetName"])
	if err != nil {
		responses.ERROR(w, http.StatusUnprocessableEntity, errors.New("missing URL parameter 'sheetName'"))
		return
	}

	sheetModel := models.Sheet{}

	sheet, err := sheetModel.FindSheetByID(server.DB, sheetName.RawPath)
	utils.GetSheetPath(sheet)

	responses.JSON(w, http.StatusOK, sheet)
}

func (server *Server) GetThumbnail(w http.ResponseWriter, r *http.Request) {
	/*
		Serve the thumbnail file
	*/

	name := mux.Vars(r)["name"]
	http.ServeFile(w, r, "thumbnails/"+name+".png")
}

func (server *Server) GetComposers(w http.ResponseWriter, r *http.Request) {
	/*
		Get authors, limited by 20 and sorted by newest
	*/

	composer := models.Composer{}

	composers, err := composer.GetAllComposer(server.DB)
	if err != nil {
		responses.ERROR(w, http.StatusInternalServerError, err)
		return
	}
	responses.JSON(w, http.StatusOK, composers)
}

package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"

	"github.com/gorilla/mux"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/models"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/responses"
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

func (server *Server) GetSheetsPost(w http.ResponseWriter, r *http.Request) {
	/*
		This endpoint will return all sheets in Page like style.
		Meaning POST request will have 2 attributes:
			- sort_by: (how is it sorted)
			- page_num: (what page)

		Return:
			- sheets: [...]
			- page_max: [7] // How many pages there are
			- page_current: [1] // What page we are on
	*/

	pagination := models.Pagination{
		Sort:  "updated_at desc",
		Limit: 10,
		Page:  2,
	}

	sheet := models.Sheet{}
	pageNew, _ := sheet.List(server.DB, pagination)

	fmt.Println(pageNew)
	responses.JSON(w, http.StatusOK, pageNew)
}

func (server *Server) GetSheet(w http.ResponseWriter, r *http.Request) {
	/*
		Get PDF file and information about an individual sheet.
		Example request: /sheet/Étude N. 1
	*/

	vars := mux.Vars(r)
	sheetName, err := url.Parse(vars["sheetName"])
	if err != nil {
		responses.ERROR(w, http.StatusUnprocessableEntity, errors.New("missing URL parameter 'sheetName'"))
		return
	}

	sheetModel := models.Sheet{}

	sheet, _ := sheetModel.FindSheetByID(server.DB, sheetName.RawPath)

	responses.JSON(w, http.StatusOK, sheet)
}

func (server *Server) GetPDF(w http.ResponseWriter, r *http.Request) {
	/*
		Serve the PDF file
		Example request: /sheet/pdf/Frédéric Chopin/Étude N. 1
	*/

	name := mux.Vars(r)["sheetName"]
	composer := mux.Vars(r)["composer"]
	http.ServeFile(w, r, "uploaded-sheets/"+composer+"/"+name+".pdf")
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

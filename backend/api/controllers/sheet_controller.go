package controllers

import (
	"fmt"
	"net/http"

	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/models"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/responses"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/utils"
)

func (server *Server) GetSheets(w http.ResponseWriter, r *http.Request) {
	// This endpoint will return max 20 sheets

	if utils.CheckAuthorization(w, r) == 0 {
		return
	}

	sheet := models.Sheet{}

	sheets, err := sheet.GetAllSheets(server.DB)
	if err != nil {
		responses.ERROR(w, http.StatusInternalServerError, err)
		return
	}
	fmt.Println(sheets)
	responses.JSON(w, http.StatusOK, sheets)
}

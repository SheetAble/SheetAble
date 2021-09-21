package controllers

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/mux"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/auth"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/forms"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/models"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/responses"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/utils"
	"net/http"
	"os"
	"path"
)

/*
	This endpoint will return all sheets in Page like style.
	Meaning POST request will have 3 attributes:
		- sort_by: (how is it sorted)
		- page: (what page)
		- limit: (limit number)
		- composer: (what composer)

	Return:
		- sheets: [...]
		- page_max: [7] // How many pages there are
		- page_current: [1] // Which page is currently selected
*/
func (server *Server) GetSheetsPage(c *gin.Context) {
	var form forms.GetSheetsPageRequest
	if err := c.ShouldBind(&form); err != nil {
		utils.DoError(c, http.StatusBadRequest, err)
		return
	}

	pagination := models.Pagination{
		Sort:  form.SortBy,
		Limit: form.Limit,
		Page:  form.Page,
	}

	var sheet models.Sheet
	pageNew, err := sheet.List(server.DB, pagination, form.Composer)
	if err != nil {
		utils.DoError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, pageNew)
}

func (server *Server) GetSheet(w http.ResponseWriter, r *http.Request) {
	/*
		Get PDF file and information about an individual sheet.
		Example request: /sheet/Étude N. 1
		Has to be safeName
	*/

	vars := mux.Vars(r)
	sheetName := vars["sheetName"]
	if sheetName == "" {
		responses.ERROR(w, http.StatusUnprocessableEntity, errors.New("missing URL parameter 'sheetName'"))
		return
	}

	sheetModel := models.Sheet{}
	fmt.Println(sheetName)

	sheet, _ := sheetModel.FindSheetBySafeName(server.DB, sheetName)

	responses.JSON(w, http.StatusOK, sheet)
}

func (server *Server) GetPDF(w http.ResponseWriter, r *http.Request) {
	/*
		Serve the PDF file
		Example request: /sheet/pdf/Frédéric Chopin/Étude N. 1
		sheetname and composer name have to be the safeName of them
	*/

	name := mux.Vars(r)["sheetName"]
	composer := mux.Vars(r)["composer"]
	http.ServeFile(w, r, os.Getenv("CONFIG_PATH")+"sheets/uploaded-sheets/"+composer+"/"+name+".pdf")
}

/*
	Serve the thumbnail file
	name = safename of sheet
*/
func (server *Server) GetThumbnail(c *gin.Context) {
	name := c.Param("name") + ".png"
	filePath := path.Join(server.Config.ConfigPath, "sheets/thumbnails", name)
	c.File(filePath)
}

func (server *Server) DeleteSheet(c *gin.Context) {
	/*
		Has to be safeName of the sheet
	*/

	sheetName := c.Param("sheetName")

	// Is this user authenticated?
	token := extractToken(c)
	_, err := auth.ExtractTokenID(token, server.Config.ApiSecret)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Check if the sheet exist
	sheet := models.Sheet{}
	err = server.DB.Model(models.Sheet{}).Where("safe_sheet_name = ?", sheetName).Take(&sheet).Error
	if err != nil {
		c.String(http.StatusNotFound, "sheet not found")
		return
	}

	_, err = sheet.DeleteSheet(server.DB, sheetName)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	c.JSON(http.StatusOK, "Sheet was successfully deleted")
}

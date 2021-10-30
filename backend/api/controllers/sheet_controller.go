package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"path"

	"github.com/SheetAble/SheetAble/backend/api/auth"
	. "github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/forms"
	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/gin-gonic/gin"
	"github.com/jinzhu/gorm"
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

/*	
	Get PDF file and information about an individual sheet.
	Example request:
		GET /sheet/Étude N. 1
	Has to be safeName
*/
func (server *Server) GetSheet(c *gin.Context) {
	sheetName := c.Param("sheetName")
	if sheetName == "" {
		utils.DoError(c, http.StatusBadRequest, errors.New("missing URL parameter 'sheetName'"))
		return
	}

	var sheetModel models.Sheet
	sheet, err := sheetModel.FindSheetBySafeName(server.DB, sheetName)
	if err != nil {
		utils.DoError(c, http.StatusInternalServerError, fmt.Errorf("unable to get sheet %s: %s", sheetName, err.Error()))
		return
	}
	c.JSON(http.StatusOK, sheet)
}

/*
	Serve the PDF file
	Example request:
		GET /sheet/pdf/Frédéric Chopin/Étude N. 1
	sheetname and composer name have to be the safeName of them
*/
func (server *Server) GetPDF(c *gin.Context) {
	sheetName := c.Param("sheetName") + ".pdf"
	composer := c.Param("composer")
	filePath := path.Join(Config().ConfigPath, "sheets/uploaded-sheets", composer, sheetName)
	c.File(filePath)
}

/*
	Serve the thumbnail file
	name = safename of sheet
*/
func (server *Server) GetThumbnail(c *gin.Context) {
	name := c.Param("name") + ".png"
	filePath := path.Join(Config().ConfigPath, "sheets/thumbnails", name)
	c.File(filePath)
}


// Has to be safeName of the sheet
func (server *Server) DeleteSheet(c *gin.Context) {
	sheetName := c.Param("sheetName")

	// Is this user authenticated?
	token := utils.ExtractToken(c)
	_, err := auth.ExtractTokenID(token, Config().ApiSecret)
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

func (server *Server) DeleteTag(c *gin.Context) {
	/*
		This endpoint will delete a given Tag
		Example Request
		DELETE /api/tag/sheet/fuer-elise
	*/

	sheet := getSheet(server.DB, c)
	if sheet == nil {
		return
	}

	var updateTagForm forms.TagRequest
	if err := c.ShouldBind(&updateTagForm); err != nil {
		utils.DoError(c, http.StatusBadRequest, fmt.Errorf("bad upload request: %v", err))
		return
	}

	tagNotFound := sheet.DelteTag(server.DB, updateTagForm.TagValue)
	if !tagNotFound {
		utils.DoError(c, http.StatusNotFound, fmt.Errorf("unable to find tag: %s", updateTagForm.TagValue))
		return
	}

	c.JSON(http.StatusOK, "Tag: ["+updateTagForm.TagValue+"] was successfully deleted")
}

func (server *Server) AppendTag(c *gin.Context) {
	/*
		This endpoint will append a new Tag
		Example Request
		POST /api/tag/sheet/fuer-elise
			Body (FormValue):
			- tagValue: New Tag
	*/

	sheet := getSheet(server.DB, c)
	if sheet == nil {
		return
	}

	var tagForm forms.TagRequest
	if err := c.ShouldBind(&tagForm); err != nil {
		utils.DoError(c, http.StatusBadRequest, fmt.Errorf("bad upload request: %v", err))
		return
	}
	if tagForm.TagValue == "" {
		utils.DoError(c, http.StatusBadRequest, fmt.Errorf("No tagValue given"))
		return
	}

	sheet.AppendTag(server.DB, tagForm.TagValue)

	c.JSON(http.StatusOK, "Tag: ["+tagForm.TagValue+"] was successfully appended")
}

func (server *Server) FindSheetsByTag(c *gin.Context) {

	var tagForm forms.TagRequest
	if err := c.ShouldBind(&tagForm); err != nil {
		utils.DoError(c, http.StatusBadRequest, fmt.Errorf("bad upload request: %v", err))
		return
	}
	if tagForm.TagValue == "" {
		utils.DoError(c, http.StatusBadRequest, fmt.Errorf("No tagValue given"))
		return
	}

	sheets := models.FindSheetByTag(server.DB, tagForm.TagValue)

	c.JSON(http.StatusOK, sheets)

}

func (server *Server) UpdateSheetInformationText(c *gin.Context) {
	/*
		This endpoint will update a sheet information text
		Example Request
		POST /api/sheet/fuer-elise/info
			Body (FormValue):
			- informationText: This is Für Elise made by Beethoven
	*/

	sheet := getSheet(server.DB, c)
	if sheet == nil {
		return
	}

	var informationForm forms.InformationTextRequest
	if err := c.ShouldBind(&informationForm); err != nil {
		utils.DoError(c, http.StatusBadRequest, fmt.Errorf("bad upload request: %v", err))
		return
	}
	if informationForm.InformationText == "" {
		utils.DoError(c, http.StatusBadRequest, fmt.Errorf("No informationForm given"))
		return
	}

	newSheet := sheet.UpdateSheetInformationText(server.DB, informationForm.InformationText, sheet)

	c.JSON(http.StatusOK, newSheet)
}

func getSheet(db *gorm.DB, c *gin.Context) *models.Sheet {
	
	// Find a sheet by its name
	sheetName := c.Param("sheetName")
	if sheetName == "" {
		utils.DoError(c, http.StatusBadRequest, errors.New("missing URL parameter 'sheetName'"))
		return nil
	}

	var sheetModel models.Sheet
	sheet, err := sheetModel.FindSheetBySafeName(db, sheetName)
	if err != nil {
		utils.DoError(c, http.StatusInternalServerError, fmt.Errorf("unable to get sheet %s: %s", sheetName, err.Error()))
		return nil
	}

	return sheet
}

package controllers

import (
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/utils"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/auth"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/models"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/responses"
)

type GetSheetsPageRequest struct {
	SortBy string `form:"sort_by"`
	Limit int `form:"limit"`
	Page int `form:"page"`
	Composer string `form:"composer"`
}

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
	var form GetSheetsPageRequest
	// TODO(jj) - finish refactoring this function to use gin
	if c.ShouldBind(&form) == nil {
		fmt.Printf("it worked the binding yay %+v\n", form)
	}
	sortBy := c.PostForm("sort_by")
	if sortBy == "" {
		sortBy = "updated_at desc"
	}

	limitInt := 0
	limit := c.PostForm("limit")
	if limit == "" {
		limitInt = 10
	} else {
		limitInt, _ = strconv.Atoi(limit)
	}

	pageInt := 0
	page := c.PostForm("page")
	if page == "" {
		pageInt = 1
	} else {
		pageInt, _ = strconv.Atoi(page)
	}

	pagination := models.Pagination{
		Sort:  sortBy,
		Limit: limitInt,
		Page:  pageInt,
	}

	var sheet models.Sheet
	pageNew, err := sheet.List(server.DB, pagination, c.PostForm("composer"))
	if err != nil {
		utils.DoError(c, http.StatusInternalServerError, err)
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

func (server *Server) GetThumbnail(w http.ResponseWriter, r *http.Request) {
	/*
		Serve the thumbnail file
		name = safename of sheet
	*/

	name := mux.Vars(r)["name"]
	http.ServeFile(w, r, os.Getenv("CONFIG_PATH")+"sheets/thumbnails/"+name+".png")
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

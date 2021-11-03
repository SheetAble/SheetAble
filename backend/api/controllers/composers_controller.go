package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"path"

	. "github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/forms"
	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/gin-gonic/gin"
	"github.com/kennygrant/sanitize"
)

/*
	This endpoint will return all composers in Page like style.
	Meaning POST request will have 3 attributes:
		- sort_by: (how is it sorted)
		- page: (what page)
		- limit: (limit number)

	Return:
		- composers: [...]
		- page_max: [7] // How many pages there are
		- page_current: [1] // Which page is currently selected
*/
func (server *Server) GetComposersPage(c *gin.Context) {
	var form forms.GetComposersPageRequest
	if err := c.ShouldBind(&form); err != nil {
		utils.DoError(c, http.StatusBadRequest, err)
		return
	}

	pagination := models.Pagination{
		Sort:  form.SortBy,
		Limit: form.Limit,
		Page:  form.Page,
	}

	var composer models.Composer
	pageNew, err := composer.List(server.DB, pagination)
	if err != nil {
		utils.DoError(c, http.StatusInternalServerError, err)
		return
	}
	c.JSON(http.StatusOK, pageNew)
}

/*
	Update a composer via PUT request
	body - formdata
	example:
		- name: Chopin
		- portrait_url: url
		- epoch: romance
*/
func (server *Server) UpdateComposer(c *gin.Context) {
	composerName := c.Param("composerName")
	if composerName == "" {
		utils.DoError(c, http.StatusBadRequest, errors.New("no composer given"))
		return
	}

	var form forms.UpdateComposersRequest
	if err := c.ShouldBind(&form); err != nil {
		utils.DoError(c, http.StatusBadRequest, fmt.Errorf("unable to parse form: %v", err))
		return
	}

	uploadComposerName := composerName
	if form.Name != "" {
		uploadComposerName = form.Name
	}

	// Uploads a portrait to the server if given
	uploadSuccess := false
	uploadSuccess = uploadPortait(form, uploadComposerName, composerName)

	composer := &models.Composer{}
	newComp, err := composer.UpdateComposer(server.DB,
		composerName,
		form.Name,
		form.PortraitUrl,
		form.Epoch,
		uploadSuccess,
	)
	if err != nil {
		utils.DoError(c, http.StatusNotFound, fmt.Errorf("composer not found: %v", err))
		return
	}
	c.JSON(http.StatusOK, newComp)
}

func (server *Server) DeleteComposer(c *gin.Context) {
	composerName := c.Param("composerName")
	if composerName == "" {
		utils.DoError(c, http.StatusBadRequest, errors.New("no composer given"))
		return
	}

	composer := &models.Composer{}
	_, err := composer.DeleteComposer(server.DB, composerName)
	if err != nil {
		utils.DoError(c, http.StatusNotFound, fmt.Errorf("failed to delete composer, composer not found: %v", err))
		return
	}

	c.JSON(http.StatusOK, "Composer deleted successfully")
}

/*
	Serve the Composer Portraits
	Example request:
		GET /composer/portrait/Chopin
*/
func (server *Server) ServePortraits(c *gin.Context) {
	name := c.Param("composerName")
	filePath := path.Join(Config().ConfigPath, "composer", name+".png")
	c.File(filePath)
}

/*
	Upload a portrait
	! Currently only PNG files supported
*/
func uploadPortait(form forms.UpdateComposersRequest, compName string, originalName string) bool {

	if form.File == nil {
		return false
	}
	portrait, err := form.File.Open()
	if err != nil {
		return false
	}

	defer portrait.Close()

	// Create the composer Directory if it doesn't exist yet
	dir := path.Join(Config().ConfigPath, "composer")
	fullpath := path.Join(dir, sanitize.Name(compName)+".png")
	if originalName != compName {
		os.Remove(path.Join(dir, originalName+".png"))
	}
	utils.CreateDir(dir)

	err = utils.OsCreateFile(fullpath, portrait)
	if err != nil {
		return false
	}
	return true
}

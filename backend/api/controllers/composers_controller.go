package controllers

import (
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/models"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/responses"
)

func (server *Server) GetComposersPage(w http.ResponseWriter, r *http.Request) {
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

	sortBy := r.FormValue("sort_by")
	if sortBy == "" {
		sortBy = "updated_at desc"
	}

	limitInt := 0
	limit := r.FormValue("limit")
	if limit == "" {
		limitInt = 10
	} else {
		limitInt, _ = strconv.Atoi(limit)
	}

	pageInt := 0
	page := r.FormValue("page")
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

	composer := models.Composer{}
	pageNew, _ := composer.List(server.DB, pagination)

	responses.JSON(w, http.StatusOK, pageNew)
}

func (server *Server) UpdateComposer(w http.ResponseWriter, r *http.Request) {

	/*
		Update a composer via PUT request
		body - formdata
		example:
			- name: Chopin
			- portrait_url: url
			- epoch: romance
	*/

	vars := mux.Vars(r)
	composerName := vars["composerName"]
	if composerName == "" {
		responses.ERROR(w, http.StatusBadRequest, errors.New("no composer given"))
		return
	}

	composer := &models.Composer{}

	newComp, err := composer.UpdateComposer(server.DB, composerName, r.FormValue("name"), r.FormValue("portrait_url"), r.FormValue("epoch"))
	fmt.Println(err)
	if err != nil {
		responses.ERROR(w, http.StatusNotFound, errors.New("composer not found"))
		return
	}

	responses.JSON(w, http.StatusOK, newComp)

}

func (server *Server) DeleteComposer(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	composerName := vars["composerName"]
	if composerName == "" {
		responses.ERROR(w, http.StatusBadRequest, errors.New("no composer given"))
		return
	}

	composer := &models.Composer{}
	_, err := composer.DeleteComposer(server.DB, composerName)
	if err != nil {
		responses.ERROR(w, http.StatusNotFound, errors.New("composer not found"))
		return
	}

	responses.JSON(w, http.StatusOK, "Composer deleted successfully")
}

func (server *Server) ServePortraits(w http.ResponseWriter, r *http.Request) {
	/*
		Serve the Composer Portraits
		Example request: /composer/portrait/Chopin
	*/

	name := mux.Vars(r)["composerName"]
	http.ServeFile(w, r, os.Getenv("CONFIG_PATH")+"composer/"+name+".png")
}

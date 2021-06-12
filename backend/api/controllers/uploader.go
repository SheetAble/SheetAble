// TODO: Spilt up function in mutliple functions
package controllers

import (
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"

	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/auth"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/models"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/responses"
)

func (server *Server) UploadFile(w http.ResponseWriter, r *http.Request) {
	// Check for authentication
	uid, err := auth.ExtractTokenID(r)
	if err != nil {
		responses.ERROR(w, http.StatusUnauthorized, errors.New("Unauthorized"))
		return
	}

	r.ParseMultipartForm(10 << 20)

	file, handler, err := r.FormFile("uploadfile")

	if err != nil {
		responses.ERROR(w, http.StatusNotFound, err)
		return
	}
	defer file.Close()

	// Check if the file is too big
	if handler.Size > 100000 {
		responses.ERROR(w, http.StatusNotAcceptable, errors.New("file too big"))
		return
	}

	path := "uploaded-sheets"
	createDir(path)

	// Handle case where no author is given
	path = checkAuthor(path, r)

	// Check if the file already exists
	fullpath := checkFile(path, w, r)
	if fullpath == "" {
		return
	}

	// Create all tags like genres categories etc
	createDivisions(r, server)

	// Create file
	createFile(uid, r, server, fullpath, w, file)

	// return that we have successfully uploaded our file!
	responses.JSON(w, http.StatusAccepted, "File uploaded succesfully")
}

func createDivisions(r *http.Request, server *Server) {
	/*
		This function handles the formvalues, these have to be seperated
		by a comma example: categories | pop, kpop, jpop
	*/
	getDivisions(server, r, "categories")
	getDivisions(server, r, "tags")
	getDivisions(server, r, "genres")
}

func getDivisions(server *Server, r *http.Request, div string) {
	// Gets the needed data from the request
	formVal := r.FormValue(div)
	if formVal == "" {
		return
	}

	categories := strings.Split(formVal, ",")
	for _, category := range categories {
		saveDivision(category, div, server)
	}
}

func saveDivision(name string, division string, server *Server) {
	// Saving the division to the database
	div := models.Division{
		Name:         name,
		DivisionName: division,
	}
	div.Prepare()
	div.SaveDivision(server.DB)
}

func checkAuthor(path string, r *http.Request) string {
	// Handle case where no author is given
	author := r.FormValue("author")
	if author != "" {
		path += "/" + author
	} else {
		path += "/unkown"
	}
	createDir(path)
	return path
}

func createFile(uid uint32, r *http.Request, server *Server, fullpath string, w http.ResponseWriter, file multipart.File) {
	sheet := models.Sheet{
		SheetName: r.FormValue("sheetName"),
		AuthorID:  uid,
	}
	sheet.Prepare()
	sheet.SaveSheet(server.DB)
	f, err := os.OpenFile(fullpath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		responses.ERROR(w, http.StatusInternalServerError, err)
		return
	}

	defer f.Close()
	io.Copy(f, file)
}

func checkFile(path string, w http.ResponseWriter, r *http.Request) string {
	// Check if the file already exists
	fullpath := path + "/" + r.FormValue("sheetName") + ".pdf"

	if _, err := os.Stat(fullpath); err == nil {
		responses.ERROR(w, http.StatusInternalServerError, errors.New("file already exists"))
		return ""
	}
	return fullpath
}

func createDir(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		os.Mkdir(path, os.ModePerm)
	}
}

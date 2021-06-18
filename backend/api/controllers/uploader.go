/*
	This file is for handeling the basic upload of sheets.
	It will upload given file in the uploaded sheets folder either under
	the unknown subfolder or under the author's name subfolder, depending on wheter an author is given or not.
*/

package controllers

import (
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/models"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/responses"
	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/utils"
)

func (server *Server) UploadFile(w http.ResponseWriter, r *http.Request) {
	// Check for authentication
	uid := utils.CheckAuthorization(w, r)
	if uid == 0 {
		return
	}

	r.ParseMultipartForm(10 << 20)

	pdfFile, _, err := r.FormFile("uploadfile")

	if err != nil {
		responses.ERROR(w, http.StatusNotFound, err)
		return
	}
	defer pdfFile.Close()

	path := "uploaded-sheets"
	thumbnailPath := "thumbnails"

	createDir(path)
	createDir(thumbnailPath)

	// Handle case where no author is given
	path = checkAuthor(path, r)

	// Check if the file already exists
	fullpath, fullpathThumbnail := checkFile(path, thumbnailPath, w, r)
	if fullpath == "" {
		return
	}

	if !createThumbnail(fullpathThumbnail, r, w) {
		return
	}

	// Create all tags like genres categories etc
	createDivisions(r, server)

	// Create file
	createFile(uid, r, server, fullpath, w, pdfFile)

	// return that we have successfully uploaded our file!
	responses.JSON(w, http.StatusAccepted, "File uploaded succesfully")
}

func createThumbnail(fullpathThumbnail string, r *http.Request, w http.ResponseWriter) bool {
	imageFile, _, err := r.FormFile("thumbnail")
	if err != nil {
		responses.ERROR(w, http.StatusNotFound, err)
		return false
	}
	defer imageFile.Close()

	osCreateFile(fullpathThumbnail, w, imageFile)
	return true
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
	author := r.FormValue("composer")
	if author != "" {
		path += "/" + author
	} else {
		path += "/unkown"
	}
	createDir(path)
	return path
}

func createFile(uid uint32, r *http.Request, server *Server, fullpath string, w http.ResponseWriter, file multipart.File) {
	// Create database entry
	sheet := models.Sheet{
		SheetName:   r.FormValue("sheetName"),
		Composer:    r.FormValue("composer"),
		UploaderID:  uid,
		ReleaseDate: createDate(r.FormValue("releaseDate")),
	}
	sheet.Prepare()
	sheet.SaveSheet(server.DB)

	osCreateFile(fullpath, w, file)
}

func osCreateFile(fullpath string, w http.ResponseWriter, file multipart.File) {
	// Create the file
	f, err := os.OpenFile(fullpath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		responses.ERROR(w, http.StatusInternalServerError, err)
		return
	}

	defer f.Close()
	io.Copy(f, file)
}

func createDate(date string) time.Time {
	// Create a usable date
	const layoutISO = "2006-01-02"
	t, _ := time.Parse(layoutISO, date)
	return t
}

func checkFile(path string, thumbnailPath string, w http.ResponseWriter, r *http.Request) (string, string) {
	// Check if the file already exists
	fullpath := path + "/" + r.FormValue("sheetName") + ".pdf"
	fullpathThumbnail := thumbnailPath + "/" + r.FormValue("sheetName") + ".png"
	if _, err := os.Stat(fullpath); err == nil {
		responses.ERROR(w, http.StatusInternalServerError, errors.New("file already exists"))
		return "", ""
	}
	return fullpath, fullpathThumbnail
}

func createDir(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		os.Mkdir(path, os.ModePerm)
	}
}

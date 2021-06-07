// TODO: Spilt up function in mutliple functions
package controllers

import (
	"errors"
	"io"
	"mime/multipart"
	"net/http"
	"os"

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
	}

	path := "uploaded-sheets"
	createDir(path)

	// Handle case where no author is given
	checkAuthor(path, r)

	// Check if the file already exists
	fullpath := checkFile(path, w, r)
	if fullpath == "" {
		return
	}

	// Create file
	createFile(uid, r, server, fullpath, w, file)

	// return that we have successfully uploaded our file!
	responses.JSON(w, http.StatusAccepted, "File uploaded succesfully")
}

func checkAuthor(path string, r *http.Request) {
	// Handle case where no author is given
	author := r.FormValue("author")
	if author != "" {
		path += "/" + author
	} else {
		path += "/unkown"
	}
	createDir(path)
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

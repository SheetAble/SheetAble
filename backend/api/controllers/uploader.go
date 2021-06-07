// TODO: Spilt up function in mutliple functions
package controllers

import (
	"errors"
	"fmt"
	"io"
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

	// Parse our multipart form, 10 << 20 specifies a maximum
	// upload of 10 MB files.
	r.ParseMultipartForm(10 << 20)
	// FormFile returns the first file for the given key `myFile`
	// it also returns the FileHeader so we can get the Filename,
	// the Header and the size of the file
	file, handler, err := r.FormFile("uploadfile")

	if err != nil {
		responses.ERROR(w, http.StatusNotFound, err)
		fmt.Println(err)
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
	author := r.FormValue("author")
	if author != "" {
		path += "/" + author
	} else {
		path += "/unkown"
	}
	createDir(path)

	// Check if the file already exists
	fullpath := path + "/" + r.FormValue("sheetName") + ".pdf"

	if _, err := os.Stat(fullpath); err == nil {
		responses.ERROR(w, http.StatusInternalServerError, errors.New("file already exists"))
		return
	}

	// Create file
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

	// return that we have successfully uploaded our file!
	responses.JSON(w, http.StatusAccepted, "File uploaded succesfully")
}

func createDir(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		os.Mkdir(path, os.ModePerm)
	}
}

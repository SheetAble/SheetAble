package controllers

import (
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api/responses"
)

func (server *Server) UploadFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("File Upload Endpoint Hit")

	// Parse our multipart form, 10 << 20 specifies a maximum
	// upload of 10 MB files.
	r.ParseMultipartForm(10 << 20)
	// FormFile returns the first file for the given key `myFile`
	// it also returns the FileHeader so we can get the Filename,
	// the Header and the size of the file
	file, handler, err := r.FormFile("uploadfile")

	if err != nil {
		fmt.Println("Error Retrieving the File")
		fmt.Println(err)
		return
	}
	defer file.Close()
	fmt.Printf("Uploaded File: %+v\n", handler.Filename)
	fmt.Printf("File Size: %+v\n", handler.Size)
	fmt.Printf("MIME Header: %+v\n", handler.Header)

	path := "uploaded-sheets"
	createDir(path)
	// Handle case where no author is given
	author := r.FormValue("author")
	if author != "" {
		path += "/" + author
	}
	createDir(path)

	// Check if the file already exists
	fullpath := path + "/" + r.FormValue("sheetName") + ".pdf"
	fmt.Println(fullpath)

	if _, err := os.Stat(fullpath); err == nil {
		responses.ERROR(w, http.StatusInternalServerError, errors.New("File already exists."))
		return
	}
	// Create file
	f, err := os.OpenFile(fullpath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		fmt.Println(err)
		return
	}

	defer f.Close()
	io.Copy(f, file)

	// return that we have successfully uploaded our file!
	fmt.Fprintf(w, "Successfully Uploaded File\n")

}

func createDir(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		err := os.Mkdir(path, os.ModePerm)
		fmt.Println(err)
		// TODO: return error
	}
}

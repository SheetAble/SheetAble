package utils

import (
	"io"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/SheetAble/SheetAble/api/responses"
)

func CreateDir(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		os.Mkdir(path, os.ModePerm)
	}
}

func OsCreateFile(fullpath string, w http.ResponseWriter, file multipart.File) {
	// Create the file
	f, err := os.OpenFile(fullpath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		responses.ERROR(w, http.StatusInternalServerError, err)
		return
	}

	defer f.Close()
	io.Copy(f, file)
}

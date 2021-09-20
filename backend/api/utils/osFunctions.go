package utils

import (
	"io"
	"mime/multipart"
	"os"
)

func CreateDir(path string) {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		os.Mkdir(path, os.ModePerm)
	}
}

func OsCreateFile(fullpath string, file multipart.File) error {
	// Create the file
	f, err := os.OpenFile(fullpath, os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return err
	}
	defer f.Close()
	io.Copy(f, file)
	return nil
}

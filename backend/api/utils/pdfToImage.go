package utils

import (
	"net/http"
	"net/url"
)

// POST request onto pdf creation
func RequestToPdfToImage(path string, name string) bool {
	_, err := http.PostForm("http://localhost:5000/createthumbnail",
		url.Values{"path": {path}, "name": {name}})

	return err == nil
}

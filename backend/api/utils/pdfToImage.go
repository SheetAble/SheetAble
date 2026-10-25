package utils

import (
	"bytes"
	"crypto/tls"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/http/httputil"
	"os"
	"path"
	"strings"

	. "github.com/SheetAble/SheetAble/backend/api/config"
)

// POST request onto pdf creation
func RequestToPdfToImage(path string, name string) bool {
	sendRequest(path, name, "https://pdf2png.sheetable.net/createthumbnail")

	return true
}

func sendRequest(path string, name string, remoteURL string) {

	var client *http.Client
	{
		// Setup a mocked http client.
		ts := httptest.NewTLSServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			b, err := httputil.DumpRequest(r, true)
			if err != nil {
				panic(err)
			}
			fmt.Printf("%s", b)
		}))

		defer ts.Close()

		client = ts.Client()
	}

	// Add InsecureSkipVerify because otherwise there would be an error
	client.Transport.(*http.Transport).TLSClientConfig = &tls.Config{InsecureSkipVerify: true}

	// Prepare the reader instances to encode
	values := map[string]io.Reader{
		"file": mustOpen(path), // lets assume its this file
		"name": strings.NewReader(name),
	}
	err := Upload(client, remoteURL, values, name)
	if err != nil {
		panic(err)
	}
}

func Upload(client *http.Client, url string, values map[string]io.Reader, name string) (err error) {
	// Prepare a form that you will submit to that URL.
	var b bytes.Buffer
	w := multipart.NewWriter(&b)
	for key, r := range values {
		var fw io.Writer
		if x, ok := r.(io.Closer); ok {
			defer x.Close()
		}
		// Add an image file
		if x, ok := r.(*os.File); ok {
			if fw, err = w.CreateFormFile(key, x.Name()); err != nil {
				return
			}
		} else {
			// Add other fields
			if fw, err = w.CreateFormField(key); err != nil {
				return
			}
		}
		if _, err = io.Copy(fw, r); err != nil {
			return err
		}

	}
	/*
		Don't forget to close the multipart writer.
		If you don't close it, your request will be missing the terminating boundary.
	*/
	w.Close()

	// Now that you have a form, you can submit it to your handler.
	req, err := http.NewRequest("POST", url, &b)
	if err != nil {
		return
	}
	// Don't forget to set the content type, this will contain the boundary.
	req.Header.Set("Content-Type", w.FormDataContentType())

	// Submit the request
	res, err := client.Do(req)
	if err != nil {
		return
	}

	// Check the response
	if res.StatusCode != http.StatusOK {
		err = fmt.Errorf("bad status: %s", res.Status)
	}

	// Save response
	defer res.Body.Close()
	out, err := os.Create(path.Join(Config().ConfigPath, "sheets/thumbnails", name+".png"))
	if err != nil {
		return
	}
	defer out.Close()
	io.Copy(out, res.Body)

	return
}

func mustOpen(f string) *os.File {
	r, err := os.Open(f)
	if err != nil {
		panic(err)
	}
	return r
}

// CreateAbcThumbnail creates a placeholder thumbnail for ABC format sheets
func CreateAbcThumbnail(name string) error {
	thumbPath := path.Join(Config().ConfigPath, "sheets/thumbnails", name+".png")
	if _, err := os.Stat(thumbPath); err == nil {
		return nil
	}
	out, err := os.Create(thumbPath)
	if err != nil {
		return err
	}
	defer out.Close()
	// Minimal 1x1 valid PNG byte sequence
	minimalPng := []byte{
		0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
		0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
		0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
		0x0d, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
		0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
		0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
	}
	_, err = out.Write(minimalPng)
	return err
}


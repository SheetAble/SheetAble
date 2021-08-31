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
	"strings"
)

// POST request onto pdf creation
func RequestToPdfToImage(path string, name string) bool {
	/*_, err := http.PostForm("http://127.0.0.1:5000/createthumbnail",
	url.Values{"path": {path}, "name": {name}})
	*/
	sendRequest(path, name, "https://pdf2png.zwerschke.net/createthumbnail")

	return true
}

func sendRequest(path string, name string, remoteURL string) {

	var client *http.Client
	{
		//setup a mocked http client.
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

	//prepare the reader instances to encode
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
	// Don't forget to close the multipart writer.
	// If you don't close it, your request will be missing the terminating boundary.
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
	out, err := os.Create("thumbnails/" + name + ".png")
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

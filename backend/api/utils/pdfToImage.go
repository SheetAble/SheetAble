package utils

import (
	"fmt"
	"os"

	"github.com/h2non/bimg"
)

// POST request onto pdf creation
/*func RequestToPdfToImage(path string, name string) bool {
	_, err := http.PostForm("http://127.0.0.1:5000/createthumbnail",
		url.Values{"path": {path}, "name": {name}})

	return err == nil
}
*/

func RequestToPdfToImage(path string, name string) bool {
	buffer, err := bimg.Read(path)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)

	}

	image, err := bimg.NewImage(buffer).Convert(bimg.JPEG)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
	}

	scaleFactor := 2.5 // To scale up the size of the JPG

	// first force resize
	newImage, errF := bimg.NewImage(image).ForceResize(int(152*scaleFactor), int(221*scaleFactor))
	if errF != nil {
		fmt.Fprintln(os.Stderr, err)
	}

	if bimg.NewImage(newImage).Type() == "jpeg" {
		fmt.Fprintln(os.Stderr, "The image was converted into jpeg")
	}

	imgPath := "thumbnails/" + name + ".jpg"

	bimg.Write(imgPath, newImage)
	return err == nil
}

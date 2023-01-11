/*
	This file is for handeling the basic upload of sheets.
	It will upload given file in the uploaded sheets folder either under
	the unknown subfolder or under the author's name subfolder, depending on whether an author is given or not.
*/

package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/SheetAble/SheetAble/backend/api/auth"
	"github.com/SheetAble/SheetAble/backend/api/forms"
	. "github.com/fiam/gounidecode/unidecode"
	"github.com/gin-gonic/gin"

	. "github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/kennygrant/sanitize"
)

// Structs for handling the response on the Open Opus API

type Response struct {
	Composers *[]Comp `json: "composers"`
}

type Comp struct {
	Name         string `json:"name"`
	CompleteName string `json:"complete_name"`
	SafeName     string `json:"safe_name"`
	Birth        string `json:"birth"`
	Death        string `json:"death"`
	Epoch        string `json:"epoch"`
	Portrait     string `json:"portrait"`
}

func (server *Server) UploadFile(c *gin.Context) {
	// Check for authentication
	token := utils.ExtractToken(c)
	uid, err := auth.ExtractTokenID(token, Config().ApiSecret)
	if err != nil || uid == 0 {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	var uploadForm forms.UploadRequest
	if err = c.ShouldBind(&uploadForm); err != nil {
		utils.DoError(c, http.StatusBadRequest, fmt.Errorf("bad upload request: %v", err))
		return
	}
	if err = uploadForm.ValidateForm(); err != nil {
		utils.DoError(c, http.StatusBadRequest, err)
		return
	}

	prePath := path.Join(Config().ConfigPath, "sheets")
	uploadPath := path.Join(Config().ConfigPath, "sheets/uploaded-sheets")
	thumbnailPath := path.Join(Config().ConfigPath, "sheets/thumbnails")

	// Save composer in the database
	comp := safeComposer(server, uploadForm.Composer)

	utils.CreateDir(prePath)
	utils.CreateDir(uploadPath)
	utils.CreateDir(thumbnailPath)

	// Handle case where no composer is given
	uploadPath = checkComposer(uploadPath, comp)

	// Check if the file already exists
	sheetName := uploadForm.SheetName
	releaseDate := uploadForm.ReleaseDate

	fullpath, err := checkFile(uploadPath, sheetName)
	if fullpath == "" || err != nil {
		return
	}

	// Create file
	theFile, err := uploadForm.File.Open()
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	defer theFile.Close()
	err = createFile(uid, server, fullpath, theFile, comp, sheetName, releaseDate, uploadForm.InformationText)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}

	// Send POST request to python server for creating the thumbnail (first page of pdf as an image)
	if !utils.RequestToPdfToImage(fullpath, sanitize.Name(Unidecode(sheetName))) {
		return
	}

	// Return that we have successfully uploaded our file!
	c.JSON(http.StatusAccepted, "File uploaded successfully")
}

func (server *Server) UpdateSheet(c *gin.Context) {

	// Check for authentication
	token := utils.ExtractToken(c)
	uid, err := auth.ExtractTokenID(token, Config().ApiSecret)
	if err != nil || uid == 0 {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	sheetName := c.Param("sheetName")

	// Delete Sheet
	var sheet models.Sheet
	_, err = sheet.DeleteSheet(server.DB, sheetName)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	server.UploadFile(c)

}

func getPortraitURL(composerName string) Comp {
	resp, err := http.Get("https://api.openopus.org/composer/list/search/" + composerName + ".json")
	if err != nil {
		fmt.Println(err)

		return Comp{
			CompleteName: composerName,
			SafeName:     sanitize.Name(Unidecode(composerName)),
			Portrait:     "https://icon-library.com/images/unknown-person-icon/unknown-person-icon-4.jpg",
			Epoch:        "Unknown",
		}
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}
	response := &Response{
		Composers: &[]Comp{},
	}

	err_new := json.Unmarshal([]byte(string(body)), response)
	fmt.Println(err_new)
	composers := *response.Composers

	// Check if the given name and the name from the API are alike
	if len(composers) == 0 || (!strings.EqualFold(composerName, composers[0].Name) && !strings.EqualFold(composerName, composers[0].CompleteName)) {
		return Comp{
			CompleteName: composerName,
			SafeName:     sanitize.Name(Unidecode(composerName)),
			Portrait:     "https://icon-library.com/images/unknown-person-icon/unknown-person-icon-4.jpg",
			Epoch:        "Unknown",
		}
	}

	return composers[0]
}

func safeComposer(server *Server, composer string) Comp {

	compo := getPortraitURL(composer)

	if compo.SafeName == "" {
		// Used for chinese/japanese chars etc
		unideCodeName := Unidecode(compo.CompleteName)
		compo.SafeName = sanitize.Name(unideCodeName)
	}

	comp := models.Composer{
		Name:        compo.CompleteName,
		SafeName:    compo.SafeName,
		PortraitURL: compo.Portrait,
		Epoch:       compo.Epoch,
	}

	comp.Prepare()
	comp.SaveComposer(server.DB)
	return compo
}

func checkComposer(path string, comp Comp) string {
	// Handle case where no composer is given
	composer := comp.SafeName
	fmt.Println(composer)
	if composer != "" {
		path += "/" + composer
	} else {
		path += "/unknown"
	}
	utils.CreateDir(path)
	return path
}

func createFile(uid uint32, server *Server, fullpath string, file multipart.File, comp Comp, sheetName string, releaseDate string, informationText string) error {
	// Create database entry
	sheet := models.Sheet{
		SafeSheetName:   sanitize.Name(Unidecode(sheetName)),
		SheetName:       sheetName,
		SafeComposer:    sanitize.Name(Unidecode(comp.CompleteName)),
		Composer:        comp.CompleteName,
		UploaderID:      uid,
		ReleaseDate:     createDate(releaseDate),
		InformationText: informationText,
	}
	sheet.Prepare()

	_, err := sheet.SaveSheet(server.DB)
	if err != nil {
		return err
	}

	err = utils.OsCreateFile(fullpath, file)
	if err != nil {
		return err
	}
	return nil
}

func createDate(date string) time.Time {
	// Create a usable date
	const layoutISO = "2006-01-02"
	t, _ := time.Parse(layoutISO, date)
	return t
}

func checkFile(pathName string, sheetName string) (string, error) {
	// Check if the file already exists
	fullpath := fmt.Sprintf("%s/%s.pdf", pathName, sanitize.Name(Unidecode(sheetName)))
	if _, err := os.Stat(fullpath); err == nil {
		return "", errors.New("file already exists")
	}
	return fullpath, nil
}

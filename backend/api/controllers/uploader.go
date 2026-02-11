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
	"github.com/jinzhu/gorm"

	. "github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/kennygrant/sanitize"
)

// Structs for handling the response on the Open Opus API

type Response struct {
	Composers *[]Comp `json:"composers"`
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

// UploadFile handles the basic upload of sheets.
// It will upload given file in the uploaded sheets folder either under
// the unknown subfolder or under the author's name subfolder, depending on whether an author is given or not.
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

	// Generate thumbnail locally using Poppler/ImageMagick
	if err := utils.GenerateThumbnailLocal(fullpath, sanitize.Name(Unidecode(sheetName))); err != nil {
		fmt.Printf("Warning: Failed to generate thumbnail for %s: %v\n", sheetName, err)
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

	origSafeName := c.Param("sheetName")
	if origSafeName == "" {
		utils.DoError(c, http.StatusBadRequest, errors.New("missing sheet name parameter"))
		return
	}

	// Find the existing sheet
	var oldSheet models.Sheet
	if err := server.DB.Where("safe_sheet_name = ?", origSafeName).First(&oldSheet).Error; err != nil {
		if gorm.IsRecordNotFoundError(err) {
			c.String(http.StatusNotFound, "Sheet not found")
		} else {
			utils.DoError(c, http.StatusInternalServerError, err)
		}
		return
	}

	// Parse form
	var uploadForm forms.UploadRequest
	if err := c.ShouldBind(&uploadForm); err != nil {
		utils.DoError(c, http.StatusBadRequest, fmt.Errorf("bad request: %v", err))
		return
	}

	// Prepare new metadata
	newSheetName := uploadForm.SheetName
	if newSheetName == "" {
		newSheetName = oldSheet.SheetName
	}
	newSafeName := sanitize.Name(Unidecode(newSheetName))

	newComposerName := uploadForm.Composer
	if newComposerName == "" {
		newComposerName = oldSheet.Composer
	}
	newSafeComposer := sanitize.Name(Unidecode(newComposerName))

	// Check if we are renaming to an already existing safe name (if changing)
	if newSafeName != oldSheet.SafeSheetName {
		var checkSheet models.Sheet
		if err := server.DB.Where("safe_sheet_name = ?", newSafeName).First(&checkSheet).Error; err == nil {
			c.String(http.StatusConflict, "A sheet with the new name already exists")
			return
		}
	}

	// Handle Composer (Ensures composer exists)
	_ = safeComposer(server, newComposerName)

	// Update paths logic
	oldPath := oldSheet.FilePath
	if oldPath == "" && oldSheet.Source == "uploaded" {
		// Fallback for older records without FilePath
		oldPath = path.Join(Config().ConfigPath, "sheets/uploaded-sheets", oldSheet.SafeComposer, oldSheet.SafeSheetName+".pdf")
	}
	newPath := oldPath

	// If it was an uploaded file OR we are about to write/move it,
	// ensure the destination is in the writable uploaded-sheets directory.
	// We move it if:
	// - It's already an uploaded file (so we can handle renames/composer changes in managed storage)
	// - A new file was uploaded (converting it to an uploaded file)
	needsMove := oldSheet.Source == "uploaded" || uploadForm.File != nil
	if needsMove {
		uploadDir := path.Join(Config().ConfigPath, "sheets/uploaded-sheets", newSafeComposer)
		utils.CreateDir(uploadDir)
		newPath = path.Join(uploadDir, newSafeName+".pdf")
	}

	// 1. If a new file is uploaded, use it
	if uploadForm.File != nil && uploadForm.File.Filename != "" {
		theFile, err := uploadForm.File.Open()
		if err != nil {
			utils.DoError(c, http.StatusInternalServerError, err)
			return
		}
		defer theFile.Close()

		// Save new file to the new (writeable) path
		if err := utils.OsCreateFile(newPath, theFile); err != nil {
			utils.DoError(c, http.StatusInternalServerError, err)
			return
		}
	} else if newPath != oldPath {
		// 2. If no new file but path changed (rename/re-composer/synced-to-uploaded)
		if _, err := os.Stat(oldPath); err == nil {
			// If moving from a read-only or different volume, we should copy.
			// For simplicity and safety, we copy then delete if it was "uploaded".
			// If it was "synced", we just copy (leaving original library untouched).
			err := utils.CopyFile(oldPath, newPath)
			if err != nil {
				fmt.Printf("Warning: Failed to copy file from %s to %s: %v\n", oldPath, newPath, err)
			} else if oldSheet.Source == "uploaded" && oldPath != newPath {
				_ = os.Remove(oldPath)
			}
		}
	}

	// Handle Thumbnail rename if needed
	oldThumb := path.Join(Config().ConfigPath, "sheets/thumbnails", oldSheet.SafeSheetName+".png")
	newThumb := path.Join(Config().ConfigPath, "sheets/thumbnails", newSafeName+".png")
	if newSafeName != oldSheet.SafeSheetName {
		if _, err := os.Stat(oldThumb); err == nil {
			_ = os.Rename(oldThumb, newThumb)
		}
	}

	// Update record
	tx := server.DB.Begin()
	// Since SafeSheetName is the primary key and might have changed, we use a manual update or delete/recreate
	if newSafeName != oldSheet.SafeSheetName {
		// If PK changed, we must delete old and create new to avoid PK issues in some GORM versions
		if err := tx.Where("safe_sheet_name = ?", oldSheet.SafeSheetName).Delete(&models.Sheet{}).Error; err != nil {
			tx.Rollback()
			utils.DoError(c, http.StatusInternalServerError, err)
			return
		}
	}

	newSheet := oldSheet
	newSheet.SafeSheetName = newSafeName
	newSheet.SheetName = newSheetName
	newSheet.SafeComposer = newSafeComposer
	newSheet.Composer = newComposerName
	newSheet.FilePath = newPath
	// If it was synced but now moved to our data folder or replaced, it is now an "uploaded" source
	if uploadForm.File != nil || newPath != oldPath {
		newSheet.Source = "uploaded"
	} else {
		newSheet.Source = oldSheet.Source
	}
	newSheet.InformationText = uploadForm.InformationText
	if uploadForm.ReleaseDate != "" {
		newSheet.ReleaseDate = createDate(uploadForm.ReleaseDate)
	}
	newSheet.UpdatedAt = time.Now()
	newSheet.PdfUrl = "sheet/pdf/" + newSafeComposer + "/" + newSafeName

	// Save (will create if newSafeName changed and old was deleted, or update otherwise)
	if err := tx.Save(&newSheet).Error; err != nil {
		tx.Rollback()
		utils.DoError(c, http.StatusInternalServerError, err)
		return
	}

	if err := tx.Commit().Error; err != nil {
		utils.DoError(c, http.StatusInternalServerError, err)
		return
	}

	// Regenerate thumbnail if file changed or renamed
	if uploadForm.File != nil || newSafeName != oldSheet.SafeSheetName {
		_ = utils.GenerateThumbnailLocal(newPath, newSafeName)
	}

	c.JSON(http.StatusOK, "Sheet successfully updated")
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

// createFile saves the file to disk and creates the corresponding database entry.
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
		FilePath:        fullpath, // Store the absolute path for consistency
		Source:          "uploaded",
		IsAvailable:     true,
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

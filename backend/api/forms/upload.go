package forms

import "mime/multipart"

type UploadRequest struct {
	File        *multipart.FileHeader `form:"uploadFile"`
	Composer    string                `form:"composer"`
	SheetName   string                `form:"sheetName"`
	ReleaseDate string                `form:"releaseDate"`
	Categories  string                `form:"categories"`
	Tags        string                `form:"tags"`
	Genres      string                `form:"genres"`
}

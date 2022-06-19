package forms

import "mime/multipart"

type UploadRequest struct {
	File            *multipart.FileHeader `form:"uploadFile"`
	Composer        string                `form:"composer"`
	SheetName       string                `form:"sheetName"`
	ReleaseDate     string                `form:"releaseDate"`
	Categories      string                `form:"categories"`
	Tags            string                `form:"tags"`
	InformationText string                `form:"informationText"`
}

// Currently a no-op but enables us to add any custom form validation in without having to change any calling code.

func (req *UploadRequest) ValidateForm() error {
	return nil
}

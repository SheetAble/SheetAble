package forms

import (
	"mime/multipart"
	"strings"
)

type UploadRequest struct {
	File            *multipart.FileHeader `form:"uploadFile"`
	Composer        string                `form:"composer"`
	SheetName       string                `form:"sheetName"`
	ReleaseDate     string                `form:"releaseDate"`
	Categories      string                `form:"categories"`
	Tags            string                `form:"tags"`
	Instruments     string                `form:"instruments"`
	InformationText string                `form:"informationText"`
}

func (req *UploadRequest) InstrumentList() []string {
	instruments := make([]string, 0)
	seen := make(map[string]bool)

	for _, instrument := range strings.Split(req.Instruments, ",") {
		instrument = strings.TrimSpace(instrument)
		key := strings.ToLower(instrument)
		if instrument == "" || seen[key] {
			continue
		}
		seen[key] = true
		instruments = append(instruments, instrument)
	}

	return instruments
}

// Currently a no-op but enables us to add any custom form validation in without having to change any calling code.

func (req *UploadRequest) ValidateForm() error {
	return nil
}

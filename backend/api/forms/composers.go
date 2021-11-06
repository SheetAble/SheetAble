package forms

import "mime/multipart"

type GetComposersPageRequest struct {
	PaginatedRequest
}

type UpdateComposersRequest struct {
	Name        string                `form:"name"`
	PortraitUrl string                `form:"portrait_url"`
	Epoch       string                `form:"epoch"`
	File        *multipart.FileHeader `form:"portrait"`
}

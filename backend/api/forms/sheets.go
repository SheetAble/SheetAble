package forms

type GetSheetsPageRequest struct {
	PaginatedRequest
	Composer string `form:"composer"`
}

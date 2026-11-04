package forms

type GetSheetsPageRequest struct {
	PaginatedRequest
	Composer   string `form:"composer"`
	Instrument string `form:"instrument"`
}

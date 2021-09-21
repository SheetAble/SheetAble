package utils

import (
	"errors"
	"net/http"

	"github.com/SheetAble/SheetAble/api/auth"
	"github.com/SheetAble/SheetAble/api/responses"
)

func CheckAuthorization(w http.ResponseWriter, r *http.Request) uint32 {
	// Check Authorization
	// Returns 0 if failed

	uid, err := auth.ExtractTokenID(r)
	if err != nil {
		responses.ERROR(w, http.StatusUnauthorized, errors.New("Unauthorized"))
		return 0
	}
	return uid
}

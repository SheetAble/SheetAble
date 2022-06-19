package forms

import "errors"

type ResetPasswordRequest struct {
	PasswordResetId string `form:"passwordResetId"`
	Password        string `form:"password"`
}

// Currently a no-op but enables us to add any custom form validation in without having to change any calling code.
func (req *ResetPasswordRequest) ValidateForm() error {
	if req.Password == "" {
		return errors.New("You need to give an updated password (formField:password).")
	}
	if req.PasswordResetId == "" {
		return errors.New("You need to give a passwordResetId.")
	}
	return nil
}

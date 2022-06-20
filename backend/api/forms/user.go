package forms

import "errors"

type ResetPasswordRequest struct {
	PasswordResetId string `form:"passwordResetId"`
	Password        string `form:"password"`
}

type RequestResetPasswordRequest struct {
	Email string `form:"email"`
}

func (req *ResetPasswordRequest) ValidateForm() error {
	if req.Password == "" {
		return errors.New("You need to give an updated password (formField:password).")
	}
	if req.PasswordResetId == "" {
		return errors.New("You need to give a passwordResetId.")
	}
	return nil
}

func (req *RequestResetPasswordRequest) ValidateForm() error {
	if req.Email == "" {
		return errors.New("You need to give an email.")
	}
	return nil
}

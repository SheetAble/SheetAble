package utils

import (
	"crypto/tls"
	"fmt"

	"github.com/SheetAble/SheetAble/backend/api/config"
	gomail "gopkg.in/mail.v2"
)

func SendPasswordResetEmail(resetPasswordId string, emailAdress string) {
	if config.Config().Smtp.Enabled == "0" {
		return
	}
	m := gomail.NewMessage()

	// Set E-Mail sender
	m.SetHeader("From", config.Config().Smtp.From)

	// Set E-Mail receivers
	m.SetHeader("To", emailAdress)

	// Set E-Mail subject
	m.SetHeader("Subject", "Password Reset Request")

	// Set E-Mail body. You can set plain text or html with text/html
	m.SetBody("text/plain", "Hey there was a password reset request to your accout. Go to "+config.Config().ServerUrl+"/reset-password/"+resetPasswordId+" to update your password") // TODO: Make HTML + make resetPasswordId a frontend URL

	// Settings for SMTP server
	d := gomail.NewDialer(config.Config().Smtp.HostServerAddr,
		config.Config().Smtp.HostServerPort,
		config.Config().Smtp.Username,
		config.Config().Smtp.Password,
	)

	// This is only needed when SSL/TLS certificate is not valid on server.
	// In production this should be set to false.
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	// Now send E-Mail
	if err := d.DialAndSend(m); err != nil {
		fmt.Println(err)
		panic(err)
	}

	fmt.Println("Sent password reset request email to: " + emailAdress)

	return
}

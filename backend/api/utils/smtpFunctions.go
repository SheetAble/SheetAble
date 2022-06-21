package utils

import (
	"crypto/tls"
	"fmt"

	gomail "gopkg.in/mail.v2"
)

func SendPasswordResetEmail(resetPasswordId string) {
	m := gomail.NewMessage()

	// Set E-Mail sender
	m.SetHeader("From", "vallezw@sheetable.net")

	// Set E-Mail receivers
	m.SetHeader("To", "v.zwerschke@mail.de")

	// Set E-Mail subject
	m.SetHeader("Subject", "Gomail test subject")

	// Set E-Mail body. You can set plain text or html with text/html
	m.SetBody("text/plain", resetPasswordId)

	// Settings for SMTP server
	d := gomail.NewDialer("smtp.strato.de", 587, "vallezw@sheetable.net", "")

	// This is only needed when SSL/TLS certificate is not valid on server.
	// In production this should be set to false.
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}

	// Now send E-Mail
	if err := d.DialAndSend(m); err != nil {
		fmt.Println(err)
		panic(err)
	}

	fmt.Println("Sent email")

	return
}

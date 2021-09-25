package utils

import (
	"github.com/gin-gonic/gin"
	"log"
	"strings"
)

func DoError(c *gin.Context, status int, err error) {
	log.Printf("%s\n", err.Error())
	c.String(status, err.Error())
}

func ExtractToken(c *gin.Context) string {
	token := c.Query("token")
	if token == "" {
		bearerToken := c.GetHeader("Authorization")
		if len(strings.Split(bearerToken, " ")) == 2 {
			token = strings.Split(bearerToken, " ")[1]
		}
	}
	return token
}

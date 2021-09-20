package controllers

import (
	"github.com/gin-gonic/gin"
	"strings"
)

func extractToken(c *gin.Context) string {
	token := c.Query("token")
	if token == "" {
		bearerToken := c.GetHeader("Authorization")
		if len(strings.Split(bearerToken, " ")) == 2 {
			token = strings.Split(bearerToken, " ")[1]
		}
	}
	return token
}

package utils

import (
	"github.com/gin-gonic/gin"
	"log"
)

func DoError(c *gin.Context, status int, err error) {
	log.Printf("%s\n", err.Error())
	c.String(status, err.Error())
}

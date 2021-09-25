package controllers

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

func (server *Server) Home(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": "Welcome To This Awesome API"})
}

package controllers

import (
	"net/http"

	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/gin-gonic/gin"
)

func (server *Server) Home(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": "Welcome To The SheetAble API " + utils.Version})
}

func (server *Server) Version(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"data": utils.Version})
}

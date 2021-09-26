package controllers

import (
	"net/http"

	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/gin-gonic/gin"
)

func (server *Server) Search(c *gin.Context) {
	searchValue := c.Param("searchValue")

	sheets := models.SearchSheet(server.DB, searchValue)

	c.JSON(http.StatusOK, sheets)
}

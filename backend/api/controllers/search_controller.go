package controllers

import (
	"net/http"

	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/gin-gonic/gin"
)

func (server *Server) SearchSheets(c *gin.Context) {
	searchValue := c.Param("searchValue")

	sheets := models.SearchSheet(server.DB, searchValue)

	c.JSON(http.StatusOK, sheets)
}

func (server *Server) SearchComposers(c *gin.Context) {
	searchValue := c.Param("searchValue")

	composers := models.SearchComposer(server.DB, searchValue)

	c.JSON(http.StatusOK, composers)
}

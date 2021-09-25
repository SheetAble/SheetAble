package controllers

import (
	"fmt"
	"github.com/gin-gonic/gin"
)

func (server *Server) Search(c *gin.Context) {
	searchValue := c.Param("searchValue")
	fmt.Println(searchValue)
}

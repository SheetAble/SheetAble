package middlewares

import (
	"net/http"

	"github.com/SheetAble/SheetAble/backend/api/auth"
	"github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/gin-gonic/gin"
)

func AuthMiddleware() gin.HandlerFunc {
	/*
		do any initial setup for the middleware once here

		- load config value in case config management
		- changes implementation where it could be a slow operation to fetch values
		- like fetching over the net to a vault/secrets server
	*/
	secret := config.Config().ApiSecret

	return func(c *gin.Context) {
		err := auth.TokenValid(utils.ExtractToken(c), secret)
		if err != nil {

			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		c.Next()
	}
}

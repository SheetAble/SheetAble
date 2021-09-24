package middlewares

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/auth"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/config"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/utils"
	"net/http"
)

func AuthMiddleware() gin.HandlerFunc {
	// do any initial setup for the middleware once here

	// load config value in case config management
	// changes implementation where it could be a slow operation to fetch values
	// like fetching over the net to a vault/secrets server
	secret := config.Config().ApiSecret

	return func(c *gin.Context) {
		err := auth.TokenValid(utils.ExtractToken(c) ,secret)
		if err != nil {
			c.AbortWithError(http.StatusUnauthorized, fmt.Errorf("Unauthorized: %v", err))
			return
		}
		c.Next()
	}
}


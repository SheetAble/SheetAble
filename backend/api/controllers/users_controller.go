package controllers

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/auth"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/config"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/models"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/utils/formaterror"
	"net/http"
	"strconv"
)

func (server *Server) CreateUser(c *gin.Context) {

	// Check for authentication
	token := extractToken(c)
	uid, err := auth.ExtractTokenID(token, server.Config.ApiSecret)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	if uid != config.ADMIN_UID {
		c.String(http.StatusUnauthorized, "only Admins are able to persue this command")
		return
	}

	var user models.User
	err = c.BindJSON(&user)
	if err != nil {
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}
	user.Prepare()
	err = user.Validate("")
	if err != nil {
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}
	userCreated, err := user.SaveUser(server.DB)

	if err != nil {
		formattedError := formaterror.FormatError(err.Error())
		c.String(http.StatusUnprocessableEntity, formattedError.Error())
		return
	}
	c.Header("Location", fmt.Sprintf("%s%s/%d", c.Request.Host, c.Request.RequestURI, userCreated.ID))
	c.JSON(http.StatusCreated, userCreated)
}

func (server *Server) GetUsers(c *gin.Context) {

	user := models.User{}

	users, err := user.FindAllUsers(server.DB)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.JSON(http.StatusOK, users)
}

func (server *Server) GetUser(c *gin.Context) {

	uidString := c.Param("id")
	uid, err := strconv.ParseUint(uidString, 10, 32)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	var newUid uint32 = 0
	if uid == 0 {

		token := extractToken(c)
		newUid, err = auth.ExtractTokenID(token, server.Config.ApiSecret)
		if err != nil {
			c.String(http.StatusUnauthorized, "Unauthorized")
		}
	}

	uid = uint64(newUid)
	user := models.User{}
	userGotten, err := user.FindUserByID(server.DB, uint32(uid))
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}
	c.JSON(http.StatusOK, userGotten)
}

func (server *Server) UpdateUser(c *gin.Context) {

	uidString := c.Param("id")
	uid, err := strconv.ParseUint(uidString, 10, 32)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	var user models.User
	err = c.BindJSON(&user)
	if err != nil {
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}

	token := extractToken(c)
	tokenID, err := auth.ExtractTokenID(token, server.Config.ApiSecret)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}
	if tokenID != uint32(uid) {
		c.String(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
		return
	}
	user.Prepare()
	err = user.Validate("update")
	if err != nil {
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}
	updatedUser, err := user.UpdateAUser(server.DB, uint32(uid))
	if err != nil {
		formattedError := formaterror.FormatError(err.Error())
		c.String(http.StatusUnprocessableEntity, formattedError.Error())
		return
	}
	c.JSON(http.StatusOK, updatedUser)
}

func (server *Server) DeleteUser(c *gin.Context) {

	uidString := c.Param("id")
	uid, err := strconv.ParseUint(uidString, 10, 32)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	token := extractToken(c)
	tokenID, err := auth.ExtractTokenID(token, server.Config.ApiSecret)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}
	if tokenID != 0 && tokenID != uint32(uid) {
		c.String(http.StatusUnauthorized, http.StatusText(http.StatusUnauthorized))
		return
	}

	var user models.User
	_, err = user.DeleteAUser(server.DB, uint32(uid))
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
		return
	}
	c.Header("Entity", fmt.Sprint(uid))
	c.JSON(http.StatusNoContent, gin.H{})
}

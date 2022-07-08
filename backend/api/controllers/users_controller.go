package controllers

import (
	"fmt"
	"time"

	"github.com/SheetAble/SheetAble/backend/api/auth"
	. "github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/forms"
	"github.com/SheetAble/SheetAble/backend/api/models"
	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/SheetAble/SheetAble/backend/api/utils/formaterror"
	"github.com/gin-gonic/gin"

	"net/http"
	"strconv"
)

func (server *Server) CreateUser(c *gin.Context) {

	// Check for authentication
	token := utils.ExtractToken(c)
	uid, err := auth.ExtractTokenID(token, Config().ApiSecret)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}

	if uid != ADMIN_UID {
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

	// Check for authentication
	token := utils.ExtractToken(c)
	uid, err := auth.ExtractTokenID(token, Config().ApiSecret)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}
	if uid != ADMIN_UID {
		c.String(http.StatusUnauthorized, "Only admins are able to persue this command")
		return
	}

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

	token := utils.ExtractToken(c)
	userId, err := auth.ExtractTokenID(token, Config().ApiSecret)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
	}

	var newUid uint32 = uint32(uid)
	if uid == 0 {
		/*
			make it the details about own user
		*/
		newUid = userId
	}

	// Check for admin
	if uid != 0 && userId != ADMIN_UID {
		c.String(http.StatusUnauthorized, "Only admins are able to look at user that aren't themselves. Try the endpoint /users/0 to look at your own user details")
		return
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
	/*
		To update a user go to endpoint:
		PUT: /api/users/:id
		Body: {
			"email": "your-updated-email"
			"password": "your-updated-password"
		}

	*/

	uidString := c.Param("id")
	uid, err := strconv.ParseUint(uidString, 10, 32)
	if err != nil {
		c.String(http.StatusBadRequest, err.Error())
		return
	}

	var user models.User
	// Set updated At param
	user.UpdatedAt = time.Now()
	err = c.BindJSON(&user)
	if err != nil {
		c.String(http.StatusUnprocessableEntity, err.Error())
		return
	}

	token := utils.ExtractToken(c)
	tokenID, err := auth.ExtractTokenID(token, Config().ApiSecret)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}
	if tokenID != uint32(uid) && tokenID != ADMIN_UID {
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
		fmt.Println(err)
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

	token := utils.ExtractToken(c)
	tokenID, err := auth.ExtractTokenID(token, Config().ApiSecret)
	if err != nil {
		c.String(http.StatusUnauthorized, "Unauthorized")
		return
	}
	if tokenID != 1 && tokenID != uint32(uid) {
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

func (server *Server) ResetPassword(c *gin.Context) {
	var form forms.ResetPasswordRequest
	if err := c.ShouldBind(&form); err != nil {
		utils.DoError(c, http.StatusBadRequest, err)
		return
	}
	if err := form.ValidateForm(); err != nil {
		utils.DoError(c, http.StatusBadRequest, err)
		return
	}

	user, err, statusCode := models.ResetPassword(server.DB, form.PasswordResetId, form.Password)
	if err != nil {
		c.JSON(statusCode, err.Error())
		return
	}

	c.JSON(http.StatusOK, user)
}

func (server *Server) RequestPasswordReset(c *gin.Context) {
	var form forms.RequestResetPasswordRequest
	if err := c.ShouldBind(&form); err != nil {
		utils.DoError(c, http.StatusBadRequest, err)
		return
	}
	if err := form.ValidateForm(); err != nil {
		utils.DoError(c, http.StatusBadRequest, err)
		return
	}

	resetPasswordId, err := models.RequestPasswordReset(server.DB, form.Email)
	if err != nil {
		c.JSON(http.StatusNotFound, err.Error())
		return
	}
	if Config().Smtp.Enabled == "0" {
		c.JSON(http.StatusBadGateway, "SMTP backend not configured. Go take a look at the docs to get started with emails.")
		return
	}
	utils.SendPasswordResetEmail(resetPasswordId, form.Email)
	c.JSON(http.StatusOK, "Sent email successfully")
}

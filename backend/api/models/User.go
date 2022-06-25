package models

import (
	"errors"
	"fmt"
	"html"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/SheetAble/SheetAble/backend/api/utils"
	"github.com/badoux/checkmail"
	"github.com/jinzhu/gorm"
	"golang.org/x/crypto/bcrypt"
)

const ()

type User struct {
	ID                  uint32    `gorm:"primary_key;auto_increment" json:"id"` // If ID == 1: user = admin
	Email               string    `gorm:"size:100;not null;unique" json:"email"`
	Role                uint8     `json:"role"` // 0=admin 1=normal,
	Password            string    `gorm:"size:100;not null;" json:"password"`
	PasswordReset       string    `gorm:"size:10;unique" json:"password_reset"` /* Random 8 char string for resetting the password (prob not the best implementation of a password reset so it could be redone)*/
	PasswordResetExpire time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"password_reset_expire"`
	CreatedAt           time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt           time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"updated_at"`
}

func Hash(password string) ([]byte, error) {
	return bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
}

func VerifyPassword(hashedPassword, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}

func (u *User) BeforeSave() error {
	hashedPassword, err := Hash(u.Password)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

func (u *User) Prepare() {
	u.ID = 0
	u.Email = html.EscapeString(strings.TrimSpace(u.Email))
	u.Role = 1
	u.PasswordReset = utils.CreateRandString(40)
	u.PasswordResetExpire = time.Now()
	u.CreatedAt = time.Now()
	u.UpdatedAt = time.Now()
}

func (u *User) Validate(action string) error {
	switch strings.ToLower(action) {
	case "update":
		if u.Password == "" {
			return errors.New("Required Password")
		}
		if u.Email == "" {
			return errors.New("Required Email")
		}
		if err := checkmail.ValidateFormat(u.Email); err != nil {
			return errors.New("Invalid Email")
		}

		return nil
	case "login":
		if u.Password == "" {
			return errors.New("Required Password")
		}
		if u.Email == "" {
			return errors.New("Required Email")
		}
		if err := checkmail.ValidateFormat(u.Email); err != nil {
			return errors.New("Invalid Email")
		}
		return nil

	default:
		if u.Password == "" {
			return errors.New("Required Password")
		}
		if u.Email == "" {
			return errors.New("Required Email")
		}
		if err := checkmail.ValidateFormat(u.Email); err != nil {
			return errors.New("Invalid Email")
		}
		return nil
	}
}

func (u *User) SaveUser(db *gorm.DB) (*User, error) {

	var err error
	err = db.Create(&u).Error
	if err != nil {
		return &User{}, err
	}
	return u, nil
}

func (u *User) FindAllUsers(db *gorm.DB) (*[]User, error) {
	var err error
	users := []User{}
	err = db.Model(&User{}).Limit(100).Find(&users).Error
	if err != nil {
		return &[]User{}, err
	}
	return &users, err
}

func (u *User) FindUserByID(db *gorm.DB, uid uint32) (*User, error) {
	var err error
	err = db.Model(User{}).Where("id = ?", uid).Take(&u).Error
	if err != nil {
		return &User{}, err
	}
	if gorm.IsRecordNotFoundError(err) {
		return &User{}, errors.New("User Not Found")
	}
	return u, err
}

func (u *User) FindUserByEmail(db *gorm.DB, email string) (*User, error) {
	var err error
	err = db.Model(User{}).Where("email = ?", email).Take(&u).Error
	if err != nil {
		return &User{}, err
	}
	if gorm.IsRecordNotFoundError(err) {
		return &User{}, errors.New("User Not Found")
	}
	return u, err
}

func (u *User) FindUserByPasswordResetId(db *gorm.DB, passwordResetId string) (*User, error) {
	var err error
	err = db.Model(User{}).Where("password_reset = ?", passwordResetId).Take(&u).Error
	if err != nil {
		return &User{}, err
	}
	if gorm.IsRecordNotFoundError(err) {
		return &User{}, errors.New("User Not Found")
	}
	return u, err
}

func (u *User) UpdateAUser(db *gorm.DB, uid uint32) (*User, error) {
	// To hash the password
	err := u.BeforeSave()
	if err != nil {
		log.Fatal(err)
	}
	db = db.Model(&User{}).Where("id = ?", uid).Take(&User{}).UpdateColumns(
		map[string]interface{}{
			"password":   u.Password,
			"email":      u.Email,
			"updated_at": time.Now(),
		},
	)
	if db.Error != nil {
		return &User{}, db.Error
	}
	// This is to display the updated user
	err = db.Model(&User{}).Where("id = ?", uid).Take(&u).Error
	if err != nil {
		return &User{}, err
	}
	return u, nil
}

func (u *User) DeleteAUser(db *gorm.DB, uid uint32) (int64, error) {

	db = db.Model(&User{}).Where("id = ?", uid).Take(&User{}).Delete(&User{})

	if db.Error != nil {
		return 0, db.Error
	}
	return db.RowsAffected, nil
}

func RequestPasswordReset(db *gorm.DB, email string) (string, error) {
	user := User{}
	_, err := user.FindUserByEmail(db, email)
	if gorm.IsRecordNotFoundError(err) {
		return "", errors.New("Email doesn't exist in the server.")
	}

	passwordReset := utils.CreateRandString(40)

	db = db.Model(&User{}).Where("email = ?", email).Take(&User{}).UpdateColumns(
		map[string]interface{}{
			"password_reset":        passwordReset,
			"password_reset_expire": time.Now().Add(time.Hour * time.Duration(1)), // Set new expire date to 1h
		},
	)

	return passwordReset, nil
}

func ResetPassword(db *gorm.DB, passwordResetId string, updatedPassword string) (*User, error, int) {
	user := User{}
	_, err := user.FindUserByPasswordResetId(db, passwordResetId)
	if gorm.IsRecordNotFoundError(err) {
		return &User{}, errors.New("This passwordResetId is invalid."), http.StatusNotFound
	}
	if user.PasswordResetExpire.Before(time.Now()) {
		return &User{}, errors.New("PasswordResetId has already expired."), http.StatusForbidden
	}

	user.Password = updatedPassword

	user.BeforeSave() /* This will hash the password */

	db = db.Model(&User{}).Where("password_reset = ?", passwordResetId).Take(&User{}).UpdateColumns(
		map[string]interface{}{
			"password":              user.Password,
			"updated_at":            time.Now(),
			"password_reset_expire": time.Now(), /* So it cannot be used a 2nd time */
		},
	)
	if db.Error != nil {
		return &User{}, db.Error, 0
	}

	fmt.Println("Update user passsword")

	return &user, nil, 0
}

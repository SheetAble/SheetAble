package api

import (
	"fmt"

	. "github.com/SheetAble/SheetAble/backend/api/config"
	"github.com/SheetAble/SheetAble/backend/api/controllers"
	"github.com/SheetAble/SheetAble/backend/api/seed"
	"github.com/SheetAble/SheetAble/backend/api/utils"
)

var (
	server = controllers.Server{}
)

func Run() {

	server.Initialize()

	utils.PrintAsciiVersion()
	seed.Load(server.DB, Config().AdminEmail, Config().AdminPassword)

	port := 8080
	if Config().Port != 0 {
		port = Config().Port
	}

	server.Run(fmt.Sprintf("0.0.0.0:%d", port), Config().Dev)
}

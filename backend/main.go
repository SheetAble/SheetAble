package main

import (
	"github.com/SheetAble/SheetAble/backend/api"
	"github.com/SheetAble/SheetAble/backend/api/utils"
)

func main() {
	utils.Version = "v0.8.1"
	utils.PrintAsciiVersion()
	api.Run()
}

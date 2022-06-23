package main

import (
	"fmt"

	"github.com/SheetAble/SheetAble/backend/api"
	"github.com/SheetAble/SheetAble/backend/api/utils"
)

func main() {
	version, err := utils.GetLatestTagFromRepository()
	if err != nil {
		fmt.Println(err)
		return
	}
	utils.Version = version
	utils.PrintAsciiVersion()
	api.Run()
}

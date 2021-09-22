package api

import (
	"fmt"
	"github.com/golobby/config/v3"
	"github.com/golobby/config/v3/pkg/feeder"
	myconfig "github.com/vallezw/SheetUploader-Selfhosted/backend/api/config"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/controllers"
	"github.com/vallezw/SheetUploader-Selfhosted/backend/api/seed"
	"log"
	"strings"
)

var (
	server = controllers.Server{}
)

func Run() {

	server.Config = myconfig.NewConfig()
	dotenvFeeder := feeder.DotEnv{Path: ".env"}
	envFeeder := feeder.Env{}
	err := config.New().AddFeeder(dotenvFeeder).AddFeeder(envFeeder).AddStruct(&server.Config).Feed()
	if err != nil {
		if !strings.Contains(err.Error(), "no such file") {
			log.Fatalf("error loading config from environment: %s", err.Error())
		}
	}
	myconfig.Config = server.Config

	server.Initialize()

	seed.Load(server.DB, server.Config.AdminEmail, server.Config.AdminPassword)

	port := 8080
	if server.Config.Port != 0 {
		port = server.Config.Port
	}

	server.Run(fmt.Sprintf("0.0.0.0:%d", port), server.Config.Dev)


}
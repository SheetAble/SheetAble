package config

import (
	"github.com/golobby/config/v3"
	"github.com/golobby/config/v3/pkg/feeder"
	"log"
	"strings"
	"sync"
)

var (
	serverConfig     ServerConfig
	configOnce sync.Once
)

func Config() ServerConfig {
	configOnce.Do(func() {
		serverConfig = NewConfig()
		dotenvFeeder := feeder.DotEnv{Path: ".env"}
		envFeeder := feeder.Env{}
		err := config.New().AddFeeder(dotenvFeeder).AddFeeder(envFeeder).AddStruct(&serverConfig).Feed()
		if err != nil {
			if !strings.Contains(err.Error(), "no such file") {
				log.Fatalf("error loading config from environment: %s", err.Error())
			}
		}
	})
	return serverConfig
}

type ServerConfig struct {
	AdminEmail    string `env:"ADMIN_EMAIL"`
	AdminPassword string `env:"ADMIN_PASSWORD"`
	ApiSecret     string `env:"API_SECRET"`
	ConfigPath    string `env:"CONFIG_PATH"`

	Dev  bool `env:"DEV"`
	Port int  `env:"PORT"`

	Database DatabaseConfig
}

// Bootstrap the application Config struct with the default config
func NewConfig() ServerConfig {
	return ServerConfig{
		AdminEmail:    "admin@admin.com",
		AdminPassword: "sheetable",
		ApiSecret:     "sheetable",
		ConfigPath:    "./config/",
		Database: DatabaseConfig{
			Driver: "sqlite",
		},
	}
}

type DatabaseConfig struct {
	Driver   string `env:"DB_DRIVER"`
	Host     string `env:"DB_HOST"`
	User     string `env:"DB_USER"`
	Password string `env:"DB_PASSWORD"`
	Name     string `env:"DB_NAME"`
	Port     int    `env:"DB_PORT"`
}

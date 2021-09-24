package config

import (
	"github.com/golobby/config/v3"
	"github.com/golobby/config/v3/pkg/feeder"
	"log"
	"strings"
	"sync"
)

var (
	serverConfig ServerConfig
	configOnce   sync.Once
)

type configBuilder struct {
	dotenvFile           string
	errorOnMissingDotenv bool
}

func ConfigBuilder() configBuilder {
	return configBuilder{}
}

func (b configBuilder) WithDotenvFile(file string) configBuilder {
	b.dotenvFile = file
	return b
}

func (b configBuilder) PanicOnMissingDotenv(status bool) configBuilder {
	b.errorOnMissingDotenv = status
	return b
}

func (b configBuilder) Build() ServerConfig {
	serverConfig = NewConfig()

	dotenvFile := ".env"
	if b.dotenvFile != "" {
		dotenvFile = b.dotenvFile
	}
	dotenvFeeder := feeder.DotEnv{Path: dotenvFile}
	envFeeder := feeder.Env{}

	err := config.New().AddStruct(&serverConfig).AddFeeder(dotenvFeeder).Feed()
	if err != nil {
		if strings.Contains(err.Error(), "no such file") && b.errorOnMissingDotenv {
			log.Fatalf("error loading config from dotenv file %s: %s", dotenvFile, err.Error())
		}
	}
	err = config.New().AddStruct(&serverConfig).AddFeeder(envFeeder).Feed()
	if err != nil {
		log.Fatalf("error loding config from environemnt: %s", err.Error())
	}
	return serverConfig
}

func Config() ServerConfig {
	configOnce.Do(func() {
		serverConfig = ConfigBuilder().Build()
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

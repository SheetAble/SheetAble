package config

import (
	"log"
	"strings"
	"sync"

	"github.com/golobby/config/v3"
	"github.com/golobby/config/v3/pkg/feeder"
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
	ServerUrl     string `env:"SERVER_URL"`
	ConfigPath    string `env:"CONFIG_PATH"`

	Dev  bool `env:"DEV"`
	Port int  `env:"PORT"`

	// Library configuration
	// NOTE: These values are used ONLY for initial database seeding on first run.
	// After the first run, library settings are managed via the database and UI.
	// Changing these values will NOT affect an existing installation.
	LibraryPath     string `env:"LIBRARY_PATH"`
	AutoScanEnabled bool   `env:"AUTO_SCAN_ENABLED"`
	ScanInterval    int    `env:"SCAN_INTERVAL"`
	OrganizeMode    bool   `env:"ORGANIZE_MODE"`
	AllowDuplicates bool   `env:"ALLOW_DUPLICATES"`

	Database DatabaseConfig
	Smtp     SmtpConfig
}

// Bootstrap the application Config struct with the default config
func NewConfig() ServerConfig {
	return ServerConfig{
		AdminEmail:    "admin@admin.com",
		AdminPassword: "sheetable",
		ApiSecret:     "sheetable",
		ServerUrl:     "http://localhost:8080",
		ConfigPath:    "./config/",
		Database: DatabaseConfig{
			Driver: "sqlite",
		},
		Smtp: SmtpConfig{
			Enabled: "0",
		},
		// Library defaults
		LibraryPath:     "",
		AutoScanEnabled: false,
		ScanInterval:    60, // 60 minutes
		OrganizeMode:    false,
		AllowDuplicates: false,
	}
}

type SmtpConfig struct {
	Enabled        string `env:"SMTP_ENABLED"`
	From           string `env:"SMTP_FROM"`
	HostServerAddr string `env:"SMTP_SERVER_ADDR"`
	HostServerPort int    `env:"SMTP_HOST_SERVER_PORT"`
	Username       string `env:"SMTP_USERNAME"`
	Password       string `env:"SMTP_PASSWORD"`
}

type DatabaseConfig struct {
	Driver   string `env:"DB_DRIVER"`
	Host     string `env:"DB_HOST"`
	User     string `env:"DB_USER"`
	Password string `env:"DB_PASSWORD"`
	Name     string `env:"DB_NAME"`
	Port     int    `env:"DB_PORT"`
}

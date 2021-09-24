package config

import (
	"github.com/go-playground/assert/v2"
	"io/ioutil"
	"log"
	"os"
	"path"
	"testing"
)

func TestDefaultConfig(t *testing.T) {
	config := NewConfig()
	assert.Equal(t, config.ApiSecret, "sheetable")
	assert.Equal(t, config.ConfigPath, "./config/")
	assert.Equal(t, config.AdminEmail, "admin@admin.com")
	assert.Equal(t, config.AdminPassword, "sheetable")
	assert.Equal(t, config.Database.Driver, "sqlite")
}

func TestEnvironmentVarzOverrideDefaults(t *testing.T) {
	os.Setenv("API_SECRET", "new secret")
	os.Setenv("ADMIN_PASSWORD", "password123")
	os.Setenv("DB_DRIVER", "mysql")
	os.Setenv("DB_PORT", "1234")
	defer os.Clearenv()
	config := Config()

	assert.Equal(t, config.ApiSecret, "new secret")
	assert.Equal(t, config.AdminPassword, "password123")
	assert.Equal(t, config.Database.Driver, "mysql")
	assert.Equal(t, config.Database.Port, 1234)
}

func TestDotEnvOverridesDefault(t *testing.T) {
	os.Setenv("ADMIN_EMAIL", "email set from environment variable")
	defer os.Clearenv()
	dotenvFile, err := ioutil.TempFile(".", ".test.*.env")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(dotenvFile.Name())
	_, err = dotenvFile.WriteString("ADMIN_EMAIL=email set from dotenv\nADMIN_PASSWORD=passwordSetFromDotenv")
	if err != nil {
		log.Fatal(err)
	}
	config := ConfigBuilder().WithDotenvFile(path.Join(".", dotenvFile.Name())).PanicOnMissingDotenv(true).Build()
	assert.Equal(t, config.AdminEmail, "email set from environment variable")
	assert.Equal(t, config.AdminPassword, "passwordSetFromDotenv")

}
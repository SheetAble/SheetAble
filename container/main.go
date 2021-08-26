package main

import (
	"os"

	"github.com/vallezw/Sheet-Uploader-Selfhosted/backend/api"
)

func setup() {
	// Ports hardcoded for illustrative purpose
	// In a more production like system, you should be
	// reading the ports from environment variables
	os.Setenv("PROXY_PORT", "80")
	os.Setenv("WEB_PORT", "3000")
	os.Setenv("API_PORT", "9000")
}

func main() {

	setup()
	// Start the web server as a concurrent process
	go func() {
		webserver.Run()
	}()
	// Start the api server as a concurrent process
	go func() {
		api.Run()
	}()
	// Start the proxy
	proxy.Run()
}

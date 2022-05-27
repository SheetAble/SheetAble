# Build Commands

Here is the guide for building the project (feel free to contribute for working commands on other systems)

1. Build frontend
   - `cd frontend`
   - `npm install`
   - `npm run build`
2. Create the rice-box.go file
   - Install [rice.go](https://github.com/GeertJohan/go.rice) binary
   - `cd backend/api/controllers`
   - `rice embed-go`
3. Run go build commands (only for windows amd, darwin arm/amd)
   - `env GOOS="windows" GOARCH="amd64" CGO_ENABLED="1" CC="x86_64-w64-mingw32-gcc" CGO_CFLAGS_ALLOW="-Xpreprocessor" go build -o ../build/sheetable-x.y-windows.exe`
   - `env GOOS="darwin" GOARCH="amd64" CGO_ENABLED="1" CGO_CFLAGS_ALLOW="-Xpreprocessor" go build -o ../build/sheetable-x.y-darwin-amd64`
   - `env GOOS="darwin" GOARCH="arm64" CGO_ENABLED="1" CGO_CFLAGS_ALLOW="-Xpreprocessor" go build -o ../build/sheetable-x.y-darwin-arm64`

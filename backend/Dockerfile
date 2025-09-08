# GO Repo base repo - Using Debian instead of Alpine to fix go-sqlite3 CGO issues
FROM golang:1.19-bullseye as builder

# Add Maintainer Info
LABEL maintainer="vallezw"

# Install build dependencies
RUN apt-get update && apt-get install -y build-essential git

RUN mkdir /app
WORKDIR /app

COPY go.mod go.sum ./

# Download all the dependencies
RUN go mod download

COPY . .

# Build the Go app
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main .

# Use Debian slim for runtime
FROM debian:bullseye-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*

RUN mkdir /app
WORKDIR /app/

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/main .

# Expose port 8000
EXPOSE 8000

# Run Executable
CMD ["./main"]

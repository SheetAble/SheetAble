# GO Repo base repo
FROM golang:1.21-bookworm AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Add Maintainer Info
LABEL maintainer="vallezw"

RUN mkdir /app
ADD . /app
WORKDIR /app

COPY go.mod go.sum ./

# Download all the dependencies
RUN go mod download

COPY . .

# Build the Go app
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o main .

# Production stage
FROM debian:bookworm-slim

# Install runtime dependencies
# - ca-certificates: for HTTPS requests
# - curl: for health checks
# - poppler-utils: for PDF thumbnail generation (pdftoppm)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir /app

WORKDIR /app/

# Copy the Pre-built binary file from the previous stage
COPY --from=builder /app/main .

# Expose port 8000
EXPOSE 8000

# Run Executable
CMD ["./main"]

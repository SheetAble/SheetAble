# Docker Deployment Guide

## Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/SheetAble/SheetAble.git
cd SheetAble

# Create a directory for your sheet music library
mkdir -p sheetmusic

# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
```

### Using Docker Only

```bash
# Build the backend image
cd backend
docker build -t sheetable-backend .

# Run the backend
docker run -d \
  -p 8080:8000 \
  -v $(pwd)/sheetmusic:/sheetmusic:ro \
  -v sheetable-data:/app/data \
  -e LIBRARY_PATH=/sheetmusic \
  --name sheetable-backend \
  sheetable-backend
```

## PDF Thumbnail Generation in Docker

The Docker image includes **Poppler utils** for first-party PDF thumbnail generation. This is automatically installed during the image build process.

### What's Included

- **pdftoppm** - Fast, reliable PDF to PNG converter
- **Debian-based (slim)** - Ensures compatibility with SQLite/CGO and Poppler
- **No external dependencies** - All processing happens locally

### Verification

Check that Poppler is available in your container:

```bash
# Check if pdftoppm is installed
docker exec sheetable-backend which pdftoppm

# Check version
docker exec sheetable-backend pdftoppm -v

# Test the diagnostic endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/library/thumbnail-tools
```

Expected response:
```json
{
  "available_tools": {
    "pdftoppm": true,
    "convert": false,
    "qlmanage": false
  },
  "recommended": "pdftoppm (Poppler) - Recommended",
  "status": "optimal"
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `sheetable` |
| `DB_PASSWORD` | Database password | `sheetable` |
| `DB_NAME` | Database name | `sheetable` |
| `ADMIN_EMAIL` | Initial admin user email | `admin@admin.com` |
| `ADMIN_PASSWORD` | Initial admin user password | `sheetable` |
| `API_SECRET` | JWT secret key | (required) |
| `PORT` | Internal server port (use 8000 for Docker) | `8080` |
| `LIBRARY_PATH` | Path to sheet music library | `/sheetmusic` |

### Volume Mounts

1. **Library Mount** (read-only recommended)
   ```bash
   -v /path/to/your/sheet/music:/sheetmusic:ro
   ```

2. **Data Persistence** (uploaded sheets, thumbnails, etc.)
   ```bash
   -v sheetable-data:/app/data
   ```

## Building for Production

### Multi-stage Build Benefits

The Dockerfile uses a multi-stage build:

1. **Builder stage** (golang:alpine)
   - Compiles the Go application
   - Includes build tools
   - ~300MB

2. **Runtime stage** (alpine:latest)
   - Only includes the compiled binary
   - Minimal dependencies (ca-certificates, curl, poppler-utils)
   - **Final image: ~50MB** (vs ~300MB with build tools)

### Build Arguments

```bash
# Build with custom Go version
docker build \
  --build-arg GO_VERSION=1.21 \
  -t sheetable-backend:latest \
  .

# Build for different architectures
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t sheetable-backend:latest \
  .
```

## Performance Optimization

### Thumbnail Generation Performance

**Local (Docker) vs External Service:**

| Metric | External Service | Docker (Poppler) |
|--------|-----------------|------------------|
| Latency | 100-500ms + network | 50-200ms |
| Reliability | Depends on network | 99.9%+ |
| Concurrent requests | Limited by service | Limited by CPU |
| Cost | Potential service fees | Free |
| Privacy | Data leaves container | Data stays local |

### Resource Limits

Set resource limits for production:

```yaml
services:
  backend:
    # ... other config ...
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Thumbnail Cache

Thumbnails are stored in `/app/data/sheets/thumbnails` inside the container. Make sure this is on a persistent volume:

```bash
# Check thumbnail cache size
docker exec sheetable-backend du -sh /app/data/sheets/thumbnails

# Clear thumbnail cache (will regenerate on next sync)
docker exec sheetable-backend rm -rf /app/data/sheets/thumbnails/*
```

## Troubleshooting

### Thumbnails Not Generating

1. **Check Poppler installation:**
   ```bash
   docker exec sheetable-backend pdftoppm -v
   ```

2. **Check permissions:**
   ```bash
   docker exec sheetable-backend ls -la /app/data/sheets/thumbnails
   ```

3. **Check logs:**
   ```bash
   docker-compose logs -f backend | grep -i thumbnail
   ```

4. **Test manually:**
   ```bash
   docker exec -it sheetable-backend sh
   cd /sheetmusic
   pdftoppm -png -f 1 -l 1 -scale-to 300 -singlefile sample.pdf /tmp/test
   ls -la /tmp/test.png
   ```

### Library Sync Issues

1. **Verify library mount:**
   ```bash
   docker exec sheetable-backend ls -la /sheetmusic
   ```

2. **Check environment variables:**
   ```bash
   docker exec sheetable-backend env | grep LIBRARY
   ```

3. **Trigger manual sync:**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:8080/api/library/scan
   ```

### Image Size Issues

If the image is too large:

```bash
# Check image size
docker images sheetable-backend

# Analyze layers
docker history sheetable-backend

# Use dive for detailed analysis
dive sheetable-backend
```

## Kubernetes Deployment

### Basic Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sheetable-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: sheetable-backend
  template:
    metadata:
      labels:
        app: sheetable-backend
    spec:
      containers:
      - name: backend
        image: sheetable-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: LIBRARY_PATH
          value: /sheetmusic
        volumeMounts:
        - name: library
          mountPath: /sheetmusic
          readOnly: true
        - name: data
          mountPath: /app/data
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
      volumes:
      - name: library
        persistentVolumeClaim:
          claimName: sheetable-library-pvc
      - name: data
        persistentVolumeClaim:
          claimName: sheetable-data-pvc
```

## Security Best Practices

1. **Use secrets for sensitive data:**
   ```bash
   docker secret create api_secret api_secret.txt
   ```

2. **Run as non-root user:**
   Add to Dockerfile:
   ```dockerfile
   RUN addgroup -g 1000 sheetable && \
       adduser -D -u 1000 -G sheetable sheetable
   USER sheetable
   ```

3. **Scan for vulnerabilities:**
   ```bash
   docker scan sheetable-backend
   ```

4. **Use read-only filesystem where possible:**
   ```yaml
   services:
     backend:
       read_only: true
       tmpfs:
         - /tmp
         - /app/data/sheets/thumbnails
   ```

## Monitoring

### Health Checks

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Metrics

```bash
# Container stats
docker stats sheetable-backend

# Detailed metrics
docker exec sheetable-backend sh -c 'ps aux && df -h'
```

## Backup and Restore

### Backup

```bash
# Backup database
docker exec postgres pg_dump -U sheetable sheetable > backup.sql

# Backup uploaded sheets and thumbnails
docker run --rm \
  -v sheetable-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/sheetable-data.tar.gz -C /data .
```

### Restore

```bash
# Restore database
docker exec -i postgres psql -U sheetable sheetable < backup.sql

# Restore data
docker run --rm \
  -v sheetable-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/sheetable-data.tar.gz -C /data
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker image
      run: |
        cd backend
        docker build -t sheetable-backend:${{ github.sha }} .
    
    - name: Test thumbnail generation
      run: |
        docker run --rm sheetable-backend:${{ github.sha }} pdftoppm -v
    
    - name: Push to registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push sheetable-backend:${{ github.sha }}
```

## FAQ

**Q: Why Poppler instead of ImageMagick?**
A: Poppler is lighter (~5MB vs ~50MB), faster, and has no policy file restrictions for PDF processing.

**Q: Can I use a different base image?**
A: Yes! For Debian/Ubuntu, change `apk add poppler-utils` to `apt-get install -y poppler-utils`.

**Q: Will this work on ARM (Raspberry Pi, Apple Silicon)?**
A: Yes! Poppler is available for ARM architectures. Use `docker buildx` for multi-arch builds.

**Q: How much disk space do thumbnails use?**
A: Approximately 50-100KB per thumbnail. For 1000 sheets, expect ~50-100MB.

**Q: Can I disable thumbnail generation?**
A: Yes, but it will impact the user experience. Thumbnails are generated asynchronously and don't block sync operations.

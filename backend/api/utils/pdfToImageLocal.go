package utils

import (
	"fmt"
	"os"
	"os/exec"
	"path"
	"path/filepath"

	. "github.com/SheetAble/SheetAble/backend/api/config"
)

// GenerateThumbnailLocal generates a thumbnail from a PDF using local processing.
// Optimized for Docker deployments with Poppler (pdftoppm) as the primary method.
func GenerateThumbnailLocal(pdfPath string, name string) error {
	cfg := Config()
	outputPath := path.Join(cfg.ConfigPath, "sheets/thumbnails", name+".png")

	// Ensure thumbnails directory exists
	thumbnailDir := path.Join(cfg.ConfigPath, "sheets/thumbnails")
	if err := os.MkdirAll(thumbnailDir, 0755); err != nil {
		return fmt.Errorf("failed to create thumbnails directory: %w", err)
	}

	// Try Poppler (pdftoppm) - recommended for Docker
	if err := generateWithPdftoppm(pdfPath, outputPath); err == nil {
		return nil
	}

	// Fallback to ImageMagick if available
	if err := generateWithImageMagick(pdfPath, outputPath); err == nil {
		return nil
	}

	return fmt.Errorf("thumbnail generation failed for %s (install poppler-utils or imagemagick)", pdfPath)
}

// generateWithPdftoppm uses Poppler's pdftoppm command (recommended for Docker)
func generateWithPdftoppm(pdfPath, outputPath string) error {
	tempBase := filepath.Join(filepath.Dir(outputPath), "temp_thumb")

	cmd := exec.Command("pdftoppm",
		"-png",    // Output as PNG
		"-f", "1", // First page
		"-l", "1", // Last page (only first page)
		"-scale-to", "300", // Scale to 300px width
		"-singlefile", // Single file output
		pdfPath,
		tempBase,
	)

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("pdftoppm failed: %w", err)
	}

	// pdftoppm with -singlefile creates tempBase.png
	tempFile := tempBase + ".png"
	defer os.Remove(tempFile) // Clean up temp file

	// Move to final location
	if err := os.Rename(tempFile, outputPath); err != nil {
		return fmt.Errorf("failed to move thumbnail: %w", err)
	}

	return nil
}

// generateWithImageMagick uses ImageMagick's convert command (fallback)
func generateWithImageMagick(pdfPath, outputPath string) error {
	cmd := exec.Command("convert",
		"-density", "150",
		pdfPath+"[0]", // First page only
		"-resize", "300x",
		"-quality", "90",
		outputPath,
	)

	if err := cmd.Run(); err != nil {
		return fmt.Errorf("imagemagick failed: %w", err)
	}

	return nil
}

// CheckThumbnailTools checks which thumbnail generation tools are available
func CheckThumbnailTools() map[string]bool {
	return map[string]bool{
		"pdftoppm": commandExists("pdftoppm"),
		"convert":  commandExists("convert"),
	}
}

// commandExists checks if a command is available in PATH
func commandExists(cmd string) bool {
	_, err := exec.LookPath(cmd)
	return err == nil
}

// GetRecommendedThumbnailMethod returns the best available method
func GetRecommendedThumbnailMethod() string {
	if commandExists("pdftoppm") {
		return "pdftoppm (Poppler) - Recommended for Docker"
	}
	if commandExists("convert") {
		return "ImageMagick convert - Fallback option"
	}
	return "None available - install poppler-utils in Docker image"
}

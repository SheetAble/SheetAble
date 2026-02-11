package scanner

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"

	. "github.com/fiam/gounidecode/unidecode"
	"github.com/kennygrant/sanitize"
)

// FileInfo represents discovered file information
type FileInfo struct {
	Path         string
	FileName     string
	Composer     string
	SafeComposer string
	Title        string
	SafeTitle    string
	Hash         string
}

// ScanDirectory recursively walks a directory tree and discovers PDF files
func ScanDirectory(rootPath string) ([]FileInfo, error) {
	var files []FileInfo

	if rootPath == "" {
		return files, nil
	}

	// Check if path exists
	if _, err := os.Stat(rootPath); os.IsNotExist(err) {
		return files, fmt.Errorf("library path does not exist: %s", rootPath)
	}

	err := filepath.Walk(rootPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		// Skip directories
		if info.IsDir() {
			return nil
		}

		// Check if it's a PDF file
		if !IsPDFFile(path) {
			return nil
		}

		// Extract metadata
		fileInfo, err := ExtractMetadata(path)
		if err != nil {
			fmt.Printf("Warning: Failed to extract metadata from %s: %v\n", path, err)
			return nil // Continue processing other files
		}

		files = append(files, fileInfo)
		return nil
	})

	return files, err
}

// IsPDFFile checks if a file is a PDF based on extension
func IsPDFFile(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	return ext == ".pdf"
}

// ExtractMetadata extracts metadata from a PDF file
func ExtractMetadata(path string) (FileInfo, error) {
	fileInfo := FileInfo{
		Path:     path,
		FileName: filepath.Base(path),
	}

	// Calculate file hash
	hash, err := CalculateFileHash(path)
	if err != nil {
		return fileInfo, err
	}
	fileInfo.Hash = hash

	// Parse filename for composer and title
	composer, title := ParseFilename(fileInfo.FileName)
	fileInfo.Composer = composer
	fileInfo.Title = title
	fileInfo.SafeComposer = sanitize.Name(Unidecode(composer))
	fileInfo.SafeTitle = sanitize.Name(Unidecode(title))

	return fileInfo, nil
}

// CalculateFileHash generates SHA256 hash for a file
func CalculateFileHash(path string) (string, error) {
	file, err := os.Open(path)
	if err != nil {
		return "", err
	}
	defer file.Close()

	hash := sha256.New()
	if _, err := io.Copy(hash, file); err != nil {
		return "", err
	}

	return hex.EncodeToString(hash.Sum(nil)), nil
}

// ParseFilename attempts to extract composer and title from filename
// Supports patterns like:
// - "Composer - Title.pdf"
// - "Composer_Title.pdf"
// - "Title.pdf" (composer will be "Unknown")
func ParseFilename(filename string) (composer string, title string) {
	// Remove extension
	nameWithoutExt := strings.TrimSuffix(filename, filepath.Ext(filename))

	// Try to split by " - "
	if strings.Contains(nameWithoutExt, " - ") {
		parts := strings.SplitN(nameWithoutExt, " - ", 2)
		if len(parts) == 2 {
			composer = strings.TrimSpace(parts[0])
			title = strings.TrimSpace(parts[1])
			return
		}
	}

	// Try to split by "_"
	if strings.Contains(nameWithoutExt, "_") {
		parts := strings.SplitN(nameWithoutExt, "_", 2)
		if len(parts) == 2 {
			composer = strings.TrimSpace(parts[0])
			title = strings.TrimSpace(parts[1])
			return
		}
	}

	// Default: use filename as title, composer is unknown
	composer = "Unknown"
	title = nameWithoutExt
	return
}

// DiscoverFiles is the main entry point for file discovery
func DiscoverFiles(libraryPath string) ([]FileInfo, error) {
	return ScanDirectory(libraryPath)
}

package main

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
)

const (
	// region          = "your-aws-region"
	// bucketName      = "your-s3-bucket-name"
	// uploadFolderKey = "uploads/"
	region          = "Europe (Stockholm) eu-north-1"
	bucketName      = "sheetalble"
	uploadFolderKey = "uploads/"
)

var (
	sess *session.Session
)

func init() {
	sess = session.Must(session.NewSession(&aws.Config{
		Region: aws.String(region),
	}))
}

func main() {
	http.HandleFunc("/upload", handleFileUpload)
	http.ListenAndServe(":8080", nil)
}

func handleFileUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}
	defer file.Close()

	fileName := header.Filename
	objectKey := uploadFolderKey + fileName

	err = uploadFileToS3(file, objectKey)
	if err != nil {
		http.Error(w, "Error uploading file to S3", http.StatusInternalServerError)
		return
	}

	fmt.Fprintf(w, "File successfully uploaded to S3!")
}

func uploadFileToS3(file multipart.File, objectKey string) error {
	uploader := s3manager.NewUploader(sess)

	_, err := uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
		Body:   file,
		ACL:    aws.String("private"), // Set ACL based on your requirements
	})

	if err != nil {
		fmt.Println("Error uploading to S3:", err)
		return err
	}

	fmt.Println("File uploaded to S3:", objectKey)
	return nil
}

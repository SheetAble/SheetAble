# syntax=docker/dockerfile:1
FROM golang:alpine
ADD . /go/src/github.com/vallezw/SheetUploader-Selfhosted/backend
WORKDIR /go/src/github.com/vallezw/SheetUploader-Selfhosted/backend




COPY go.mod ./
COPY go.sum ./
RUN go mod download
RUN apk add build-base

COPY *.go ./

RUN go build -o /docker-gs-ping

EXPOSE 8080

CMD [ "/docker-gs-ping" ]
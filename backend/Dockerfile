# syntax=docker/dockerfile:1
##
## Build
##
FROM golang:1.16-buster AS build

# WORKDIR /app

ADD . /go/src/github.com/vallezw/SheetUploader-Selfhosted/backend
WORKDIR /go/src/github.com/vallezw/SheetUploader-Selfhosted/backend


COPY go.mod ./
COPY go.sum ./
RUN go mod download
ADD ./database.db database.db

COPY . ./

RUN go build -o /docker-gs-ping

##
## Deploy
##
FROM gcr.io/distroless/base-debian10

WORKDIR /

COPY --from=build /docker-gs-ping /docker-gs-ping

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/docker-gs-ping"]
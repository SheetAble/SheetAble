# syntax=docker/dockerfile:1

FROM python:3.8-slim-buster

WORKDIR /app

RUN apt-get update
RUN apt-get install poppler-utils -y

RUN pip3 install flask pdf2image

COPY . .

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]
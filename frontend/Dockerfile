# Build stage
FROM node:14-alpine as build-stage

RUN apk add --no-cache python3 g++ make
# Ensure node-gyp uses python3
ENV PYTHON=/usr/bin/python3

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:stable-alpine

COPY --from=build-stage /app/build /usr/share/nginx/html

# Add nginx config if needed, otherwise default is fine
# For React Router to work, we usually need a small config
RUN echo 'server { \
    listen 80; \
    client_max_body_size 50M; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
    location /api { \
        proxy_pass http://backend:8000; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

FROM nginx:latest

COPY src/ /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
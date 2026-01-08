FROM nginx:latest

COPY src/main/resources/static/ /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/conf.d/default.conf

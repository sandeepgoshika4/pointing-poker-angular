FROM nginx:alpine

COPY dist/pointing-poker/ /usr/share/nginx/html/

EXPOSE 80

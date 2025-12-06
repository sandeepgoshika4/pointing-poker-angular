# Stage 1: Build Angular App
FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --prod

# Stage 2: NGINX server
FROM nginx:alpine
RUN mkdir -p /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/* || true

COPY --from=build /app/dist/pointing-poker/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

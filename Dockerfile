# === Stage 1: Build Angular app ===
FROM node:22-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build --prod

# === Stage 2: Use NGINX to serve the app ===
FROM nginx:alpine

# Make sure folder exists
RUN mkdir -p /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/* || true

COPY --from=build /usr/src/app/dist/pointing-poker/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# === Stage 1: Build Angular app ===
FROM node:22-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build --prod

# === Stage 2: Use NGINX to serve the app ===
FROM nginx:alpine

COPY --from=build /usr/src/app/dist/pointing-poker/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

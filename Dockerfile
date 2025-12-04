# === Stage 1: Build Angular app ===
FROM node:22-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build --prod

# === Stage 2: Serve using NGINX ===
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy Angular browser output to NGINX html folder
COPY --from=build /usr/src/app/dist/pointing-poker/browser/ /usr/share/nginx/html/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

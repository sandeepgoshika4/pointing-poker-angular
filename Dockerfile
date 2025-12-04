# === Stage 1: Build Angular app ===
FROM node:18-alpine AS build
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build --prod

# === Stage 2: NGINX to serve the built app ===
FROM nginx:alpine
# Replace YOUR_APP_DIST_FOLDER with your dist folder name
COPY --from=build /usr/src/app/dist/pointing-poker/ /usr/share/nginx/html/

# Optional: custom NGINX config later if you want
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

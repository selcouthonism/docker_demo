# -------- Stage 1: Build the React app --------
FROM node:24.10.0-slim AS builder

WORKDIR /app

# Copy package.json and package-lock.json for faster builds
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the React app (Vite + TS)
RUN npm run build

# -------- Stage 2: Serve with Nginx --------
FROM nginx:stable-alpine-slim

# Copy build output to Nginx html folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
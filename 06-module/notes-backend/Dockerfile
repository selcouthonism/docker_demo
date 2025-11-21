# -------- Development Stage --------
FROM node:24.10.0-slim AS development

# Set working directory
WORKDIR /app

# Copy dependency manifests first (for caching)
COPY package*.json ./

# Install all dependencies (dev + prod) (typescript is in devDependencies)
RUN npm ci

# Copy all source code
COPY . .

# Build application
CMD ["npm", "run", "dev"]


# -------- Build Stage --------
FROM node:24.10.0-slim AS build

# Set working directory
WORKDIR /app

# Copy dependency manifests first (for caching)
COPY package*.json ./

# Install all dependencies (dev + prod) (typescript is in devDependencies)
RUN npm ci --only=production

# Copy all source code
COPY src ./src

# -------- Production Stage --------
#FROM node:24.10.0-slim AS production
FROM gcr.io/distroless/nodejs24 AS production

# Set working directory
WORKDIR /app

# Copy only production dependencies from build stage
COPY --from=build /app/node_modules ./node_modules

#Copy from build stage rather than local host to avoid accidentally including unwanted local files. Consistent build, independent of local machine state.
COPY --from=build /app/src ./src

# Start application
# Distroless has no node binary — not call node manually - distroless already sets node as the entrypoint internally.
CMD ["src/index.js"]
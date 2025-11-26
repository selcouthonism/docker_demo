# Microservice Architecture

## notebook-backend-ts
### Setup the notebook backend application:
Setup notebook-backend-ts project:
```
npm init -y
npm install express@5.1.0 mongoose@8.20.0 uuid dotenv --save-exact
npm install -D typescript @types/node @types/express
npm install --save-dev @types/uuid
```

Install typescript development dependency:
```
npm install --save-dev --save-exact tsx@4.19.1
```

Initialize typescript project (add tsconfig.json):
```
npx tsc --init --rootDir src --outDir dist --esModuleInterop true --moduleResolution node --strict true
```

> Notes: Node Native Support: Newer Node versions (like Node 20+) support native .env loading with **--env-file** (run app with: node --env-file=.env index.js) or **process.loadEnvFile**. This may reduce the need for dotenv in some cases.

### Test notebooks service:

#### 1) POST /api/notebooks — create a new notebook
```
curl -X POST http://localhost:3000/api/notebooks \
  -H "Content-Type: application/json" \
  -d '{"name": "My Notebook", "description": "Some description"}'
```

#### 2) GET /api/notebooks — list all notebooks
```
curl http://localhost:3000/api/notebooks
```

#### 3) GET /api/notebooks/:id — get a specific notebook
```
curl http://localhost:3000/api/notebooks/<NOTEBOOK_ID>
```

#### 4) PUT /api/notebooks/:id — update notebook
```
curl -X PUT http://localhost:3000/api/notebooks/<NOTEBOOK_ID> \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated name", "description": "New description"}'
```

#### 5) DELETE /api/notebooks/:id — delete a notebook
```
curl -X DELETE http://localhost:3000/api/notebooks/<NOTEBOOK_ID>
```

#### 6) GET /health — health check
```
curl http://localhost:3000/health
```

## notes-backend

### Setup
```
npm init -y
npm i --save-exact express@5.1.0 mongoose@8.20.0
npm i --save-exact --save-dev nodemon@3.1.10
```

### Setup Dockerfile for development and production
```
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
```
This Dockerfile uses a multi-stage build pattern to optimize for both development convenience and production efficiency. In the first stage (labelled development), it starts **from node:24.10.0-slim**, sets the working directory to /app, copies only the *package*.json* files to leverage Docker’s layer caching for dependencies, runs **npm ci** to install all dependencies (including devDependencies like TypeScript), copies the entire source code into the image, and then sets the default command to **npm run dev**. This stage is optimized for developer workflow—hot-reload, full tooling, etc.

The second stage (labelled build) begins also **from node:24.10.0-slim**, again sets the working directory, copies the dependency manifests, installs dependencies without devDependencies (using **npm ci --only=production**), and then only copies the src folder. This stage prepares only what is needed for production: runtime dependencies + compiled (or transpiled) code, isolating build tools out of the final image.

The final stage (labelled production) uses a distroless base image (gcr.io/distroless/nodejs24). Distroless images are minimal runtime images with no shell, package manager, or extra tools, designed for production to minimize image size and attack surface. In this stage, the Dockerfile copies the *node_modules* directory from the build stage, then the src folder, and sets the command to run the **src/index.js** file (the distroless image has Node as its entrypoint). The result is a lightweight production image focused solely on running the application, not building it.

Overall, the design achieves a clear separation of concerns: development image for local iteration, build image for preparing production artifacts, and runtime image for deployment. This approach minimizes unnecessary tooling in production, reduces attack surface, speeds up deployments, and leverages Docker caching for dependencies.

```
docker build -t notes-backend:dev --target=development .
```
This Docker command builds a Docker image named *notes-backend:dev* by targeting a specific stage in a multi-stage Dockerfile called development. Using **--target=development** tells Docker to stop building after finishing that development stage (instead of going on to include production-only steps), which is useful for creating a dev-friendly image that may contain extra tooling, build dependencies, or debugging utilities.

```
docker build -t notes-backend:prod --target=production .
```
The command tells Docker to build a Docker image from the production stage defined in your Dockerfile, and tag that image as notes-backend:prod. By using **--target=production**, Docker will stop building once it reaches the production stage—skipping any later stages—and thus produce a lean, production-optimized image, typically without development dependencies or build tools.

```
docker history notes-backend:dev
docker history notes-backend:prod
```

## Top-level Compose YAML:

### compose.yaml
Top-level Compose YAML:
```
include:
  - notebook-backend-ts/compose.yaml
  - notes-backend/compose.yaml
```
With Docker Compose v2.20+ (which supports include), each file listed under include is treated as a separate Compose application model. Docker will load those Compose files and merge their defined services, networks, volumes, etc. into your main Compose application. Relative paths inside each included Compose file are resolved based on that file’s own directory, so you don’t have to worry about path conflicts. This approach helps modularize your Docker configuration: you can split your infrastructure into logical parts (e.g. notebook-backend-ts and notes-backend) and maintain them independently, yet still run them together via a “parent” Compose file.

### Add nginx reverse-proxy:
```
services:
  reverse-proxy:
    image: nginx:1.29.3
    volumes:
      - type: bind
        source: ./reverse-proxy/nginx.conf
        target: /etc/nginx/nginx.conf
    ports:
      - 8080:80
    networks:
      - backend-app-net
    depends_on:
      - notebooks #service name must match with notebook-backend-ts/compose.yaml
      - notes

networks:
  backend-app-net:
```
The block defines a reverse-proxy service using the official Nginx image. It mounts your own nginx.conf file into the Nginx container by using a bind volume, so that your custom configuration (e.g. proxy rules) is used rather than the default. By publishing port **8080:80**, you expose Nginx on port 8080 of the host, mapping it to port 80 inside the container. The **depends_on** directive ensures that Nginx starts after your backend services (notebooks and notes), so it can reliably proxy to them. Finally, attaching reverse-proxy to the **backend-app-net** network means Nginx and your backend services share a Docker network, which allows Nginx to refer to them by their service names (DNS) for proxying.

### compose.override.yaml

```
services:
  notebooks:
    networks:
      - backend-app-net
  notes:
    networks:
      - backend-app-net
```
That **compose.override.yaml** fragment is adding both the notebooks and notes services to a network named backend-app-net. In Docker Compose, an override file (by default docker-compose.override.yaml or compose.override.yaml) is merged on top of your main Compose file.

This file instructing Docker Compose that both services should be connected to the backend-app-net network so they can communicate with each other and potentially other backend services in an isolated network. This is helpful to separate different parts of your application (e.g. frontend vs backend vs database) or to establish a custom network topology.
Using an override file for this means you don’t have to modify your base compose.yaml. Instead, you layer additional configuration (like networking) according to the environment or your Docker stack layout.

(https://docs.docker.com/compose/how-tos/multiple-compose-files/merge/)

### Test notebooks and notes service with nginx service:
```
docker compose up --build --watch
```

Call notebook service:
```
curl -i http://localhost:8080/api/notebooks
```

Call notes service:
```
curl -i -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "My Note", "content": "Note content"}'
```

```
curl -i http://localhost:8080/api/notes/<NOTE_ID>
```

```
curl -i http://localhost:8080/api/notes/
```

### Chain of Express middlewares
```
  /*
  const A = (req, res, next) => {
    // Some validation (checking request body, headers, auth, etc.) ...

    //If validation succeeds → call next() → go to middleware B
    next();
  }

  const B = (req, res, next) => {
    // Some business logic (service calls, DB operations, etc.) ...

    // It skips all remaining non-error middlewares 
    // and jumps directly to the error-handling middleware
    next(err);
  }

  // Express identifies error handlers ONLY by the function signature
  const C = (error, req, res, next) => {
    // Some error processing ...
    // log the error
    // convert internal errors to safe API responses
    // send a consistent error JSON
  }

  router.post('/', A, B, C);
  */
```
Express executes them in order, and each middleware decides whether to:
- continue to the next middleware (next())
- stop the chain and return a response (res.send(...))
- pass an error to the error-handler middleware (next(err))

- **next()** → go to the next middleware
- **next(error)** → go to the nearest error-handling middleware
- An error-handling middleware must have 4 parameters: (err, req, res, next)


### Call notebooks service from notes service

Install axios dependency to notes-backend application:
```
npm install --save-exact axios@1.13.2
```

Update compose.override.yaml:
```
notes:
    environment:
      - NOTEBOOKS_API_URL=http://notebooks/api/notebooks
```

#### Test:

1. Create a Notebook:
```
curl -i http://localhost:8080/api/notebooks \
  -H "Content-Type: application/json" \
  -d '{"name": "My Notebook", "description": "Some description"}'
```

2. Create a Note linked to that notebook:
```
curl -i -X POST http://localhost:8080/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "My Note", "content": "Note content", "notebookdId":<NOTEBOOK_ID>}'
```

3. Verify a specific note exists:
```
curl -i http://localhost:8080/api/notes/<NOTE_ID>
```

4. Fetch all notes:
```
curl -i http://localhost:8080/api/notes/
```
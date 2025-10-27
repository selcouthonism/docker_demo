# express_api

## Create an express project
Before installing, download and install Node.js.

**npm init <initializer>** can be used to set up a new or existing npm package.

If the initializer is omitted (by just calling ***npm init***), init will fall back to legacy init behavior. It will ask you a bunch of questions, and then write a package.json for you. It will attempt to make reasonable guesses based on existing fields, dependencies, and options selected. It is strictly additive, so it will keep any fields and values that were already set. You can also use **-y**/**--yes** to skip the questionnaire altogether. If you pass **--scope**, it will create a scoped package.

Create a package.json:
```
npm init -y
```

Install packages/dependencies:
```
npm install express@5.1.0 body-parser@2.2.0 --save-exact
```

Add start script (**"start": "node src/index.js"**) into package.json to start the Node.js application using npm and start app with:
```
npm start
```

Test it:
```
curl http://localhost:3000
```

### nodemon
**nodemon** is a development tool for Node.js that automatically restarts your app whenever you change your source code — no need to manually stop and restart the server every time. Instead of doing Ctrl + C and then npm start again after each file change, nodemon watches your project files and restarts the app automatically. It saves you time while coding.

Install nodemon (development only) to auto-reload on changes:
```
npm install --save-dev nodemon
```
- **--save-dev** → Save it to devDependencies (which means: only needed during development, not in production). Nodemon will be available during development. It won’t be installed in production builds, which is good practice.

Add start script for dev **dev": "nodemon src/index.js** into package.json and Start app with:
```
npm run dev
```

### Create Dockerfile (first draft):
```
#Provides the operating system and the Node.js runtime environment that the Express application needs to run
FROM node:24.10.0

WORKDIR /app

#Copy package.json and package-lock.json
COPY package*.json .

#Install the dependencies
RUN npm ci

#Copy the source code of application
COPY src/index.js index.js

#Expose the application port
EXPOSE 3000

#Start application
CMD [ "node", "index.js" ]
```

Build docker image:
```
docker build -t express_api_image:0.0.1 .
```

Run docker image:
```
docker run -d -p 3000:3000 --name express_api express_api_image:0.0.1
```

> Note: By copying **package.json** and running ***npm ci*** before copying the rest of the application's source code, you ensure that the dependency installation layer is cached. This means if only your application code changes (and not the dependencies), Docker can reuse the cached dependency layer, speeding up subsequent builds and potentially reducing image size by avoiding unnecessary rebuilds.

### Environment:

Run container with environment -e/--env:
```
docker run --env APP_NAME="App from CLI" --env PORT=3000 -d -p 3000:3000 --name express_cli express_api_image:0.0.1
docker run -e APP_NAME="App from CLI" -e PORT=3000 -d -p 3000:3000 --name express_cli express_api_image:0.0.1
```

Run container with environment file:
```
docker run --env-file ".env.dev" -d -p 3001:3001 --name express_dev express_api_image:0.0.1
```

### Layered Architecture
A Docker image is not a single file. It is a stack of read-only layers (Docker uses a layered architecture), which means every image is built as a stack of immutable layers, where each instruction in your Dockerfile adds a new layer.

When you run the container, Docker creates one writable layer on top — that’s the container layer. All layers except the top one are immutable (never change — only replaced).

```
┌────────────────────-┐   ← Writable container layer (deleted when container is removed)
│    Your changes     │
├────────────────────-┤
│   Source code layer │  ← From COPY
├────────────────────-┤
│   Dependencies layer│  ← From RUN npm install
├────────────────────-┤
│   Base image layer  │  ← From node:24.10.0 (Debian/Alpine base OS)
└────────────────────-┘
```

**docker history** is a Docker CLI command that shows you every layer that makes up an image — including which Dockerfile instruction created it, how big each layer is, and when it was created.

```
docker history express_api_image:0.0.1
```

### Optimization
Choosing a smaller base image like node:alpine or a "slim" version is an excellent way to reduce the overall size of your Docker image. These images are much more lightweight than the full Node.js images because they contain only the essential components needed to run Node.js.

#### Use multi-stage builds ??????
- Use multi-stage builds: install dev dependencies in a build stage, then copy only runtime dependencies to the final image (smaller, cleaner image).
- Balance between compatibility and size: Use node:24.10.0-slim instead of node:24.10.0. 
node:24.10 is the full Debian image (~350+ MB). Only use (node:24.10) if you need all Debian packages preinstalled.
node:24.10.0-slim is based on Debian slim. It is stable and widely supported. It is compatible with almost all npm packages, including those requiring native modules. Also security patches are applied regularly.
- Always pin Node.js version for reproducibility: node:24.10.0-slim instead of node:24-slim.

#### .dockerignore file
Just like a .gitignore file, a **.dockerignore** file tells Docker which files and directories to exclude when building the image. This prevents unnecessary files (like node_modules from your local development environment, or build artifacts) from being copied into the image, which can significantly reduce its size.

.dockerignore file:
```
node_modules
npm-debug.log*
.git
.gitignore
.DS_Store
**/*.env*
```




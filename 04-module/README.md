# Projects
- [express_api](#express_api)
- [typescript_api](#typescript_api)
- [react_app](#react_app)
- [spring_api](#spring_api)

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

> Note: Express 5 already includes modern body parsing (express.json(), express.urlencoded()), and body-parser is no longer needed in 2025.

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

Build Dockerfile:
```
docker build -t express_api_image:0.0.2 -f Dockerfile.multistage .
```

```
docker run --rm --name express_multi_stage -d -p 3000:3000 express_api_image:0.0.2
```

#### Distroless Image:
A distroless image is a container image with a minimal list of applications that also shares the host Linux kernel. Distroless container images contains only the runtime and libraries required to run your app and don’t include a package manager, shell or a web client (such as curl or wget). With fewer components to exploit, distroless images limit what attackers can do if a container is compromised. This makes them a practical alternative for developers struggling with the utility and security dilemma that comes with Linux distros. 

Examples for Node.js: gcr.io/distroless/nodejs:24 (Usually smaller than node:slim (~40–60 MB vs 120 MB))

Using Distroless images comes with several caveats. Since there is no shell included, you cannot run bash or sh inside the container for quick debugging, so all logs and troubleshooting must rely on application-level logging. Additionally, you must copy only the necessary files into the image, as Distroless requires everything your app needs to be present; while the Node.js binary is included, any native dependencies must already exist in your node_modules. There is also no package manager or system tools available, so you cannot install new packages at runtime, and utilities such as curl or git are not included. Finally, the ENTRYPOINT or CMD must point to an executable that exists in the image, for example, ["node", "src/index.js"].

The following Docker instruction will create an error:
```
FROM gcr.io/distroless/nodejs24 AS production

RUN useradd -m appuser
USER appuser
```

Error message:
```
runc run failed: unable to start container process: error during container init: exec: "/bin/sh": stat /bin/sh: no such file or directory
```

Distroless images don’t include a shell or package manager, so commands like **useradd** cannot be run inside the container. Let me explain carefully. **RUN useradd -m appuser** is a build-time command that executes in a shell (/bin/sh) and Distroless images do not have /bin/sh or any shell. Therefore, Docker cannot execute useradd and throws an error.

```
docker build -t express_api_image:0.0.3 -f Dockerfile.multistage-distroless .
```

```
docker run --rm --name express_multi_stage_distroless -d -p 3000:3000 express_api_image:0.0.3
```

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

#### Initial unresponsiveness
One common reason for initial unresponsiveness is that the application might not be fully initialized and listening for connections immediately after the CMD instruction runs. While CMD node index.js starts the application, there might be a brief period where the server is still booting up or connecting to databases.

To address this, you could implement a health check within your Dockerfile or your orchestration system (like Docker Compose or Kubernetes). A health check periodically pings a specific endpoint of your application to ensure it's not just running, but also ready to serve requests. This prevents traffic from being routed to an application that's still starting up.

Another approach is to ensure that the application's startup script (e.g., index.js) handles all necessary initialization synchronously or with proper callbacks/promises before it signals that it's ready to accept connections.

# typescript_api

## Preparation commands:

Create a package.json:
```
npm init -y
```

Install packages/dependencies:
```
npm install express@5.1.0 --save-exact
```

Install typescript development dependency:
```
npm install --save-dev --save-exact typescript@5.9.3 @types/express
```

Install typescript development dependency:
```
npm install --save-dev --save-exact tsx@4.19.1
```

Initialize typescript project (add tsconfig.json):
```
npx tsc --init --rootDir src --outDir dist --esModuleInterop true --moduleResolution node --strict true
```

**esModuleInterop**: Lets TypeScript gracefully interoperate with both ES Modules (import something from 'x') and old CommonJS (module.exports = …). In 2025, ALWAYS set this to **true**. It makes TypeScript behave like real modern JavaScript.

When esModuleInterop: true, you can write:
```
import express from "express"; // works like in modern ESM
```

If it's false, you'd be forced to write:
```
import * as express from "express"; // clunky, older style
```

**moduleResolution**: Controls how TypeScript locates and resolves imported modules. Think: “how should TS behave when it sees an import x from './file'?”

Options: 
- **node**: Old Classic Node.js module resolution strategy ("module": "nodenext", "moduleResolution": "nodenext")
- **bundler**: Modern behavior same as Vite / Webpack / Node ESM — future-proof
- **nodenext**: Fully aligns with Node.js’s native .mjs/.cjs behavior ("module": "commonjs", "moduleResolution": "node")

For backend servers: "node" or "nodenext" is fine. For frontend or SSR-ready: use "bundler" (recommended going forward).

## Start the application:

The workflow is:
- **npm run dev** while coding
- **npm run build** before deployment
- **npm start** on the server

Development (auto-reload on changes):
It uses tsx watch src/index.ts and watches your .ts files and reloads automatically.
```
npm run dev
```

Build (compile TypeScript → JavaScript):
It uses **tsc** and compiles all TypeScript files in **src/** into **dist/**. It generates .js files + .d.ts declarations if enabled.
```
npm run build
```

Production (run compiled code):
It runs **node dist/index.js** (Make sure you ran **npm run build** first)
```
npm start
```

Run the Node.js runtime to execute JavaScript file (running the compiled TypeScript output in the dist folder (index.js)):
```
PORT=4000 node dist/index.js
```
PORT=4000 sets an environment variable called PORT for this single command execution. The Node.js app can read it with (const port = process.env.PORT || 3000). If you don’t set it, your app will fallback to 3000 (or whatever default you coded).


### Run TypeScript files directly:
```
node src/index.ts
```
Normally, Node.js cannot run TypeScript files directly because it only understands JavaScript. **src/index.ts** is a TypeScript file (contains type annotations and maybe ESNext syntax). If you just run **node src/index.ts**, it will fail unless you have a tool that allows Node to execute TypeScript on the fly.

The behavior is different with Node 24 + ESM support. **Node 24** + **"type": "module"** + **tsx** allows native execution of .ts files with ES modules. The runtime automatically handles TypeScript transpilation in memory, so it does not throw any error.

**"type": "commonjs"** in package.json: Node treats .js files as CommonJS modules (uses require() / module.exports).
If your code has ES module syntax (import express from "express"), Node cannot run .ts files directly. You must compile first (tsc) or use ts-node/tsx.

**"type": "module"** in package.json: Tells Node to treat all .js files (and .ts via tsx/ts-node) as ES modules. Node can now natively understand import / export syntax. When combined with a runtime like tsx, Node can also run .ts files directly.

### Create Dockerfile:

**--only=production** only installs the production dependencies but typescript is in devDependencies so **tsc** is never installed (npm ci -only=production build fails). 
In the following, install all dependencies in build stage and remove dev deps after build.
```
RUN npm ci
RUN npm prune --omit=dev
```

Copy source code and compile it in the first stage:
```
COPY tsconfig.json tsconfig.json 
COPY src ./src
RUN npm run build
```

Copy the compiled code from first stage into second stage:
```
COPY --from=build /app/dist ./dist
```

Create docker image:
```
docker build -t typescript_api_image:0.0.1 -f Dockerfile.multistage-distroless .
```

```
docker run --rm --name ts_multi_stage_distroless -d -p 3000:3000 typescript_api_image:0.0.1
```

# react_app

## Preparation commands:

Create react project:
```
npm create vite@latest react_app -- --template react
```

Create react project with typescript (This one is used in this project):
```
npm create vite@latest react_app -- --template react-ts
```
Creates a new React + TypeScript project called react_app, using the latest Vite template.

**vite@latest** ensures you’re using the latest version of the Vite scaffolding tool. It guarantees you’re not accidentally using an older cached version on your machine and it’s the recommended way to always start with the most up-to-date project setup.

**--template react**: The language is JavaScript (ES6)

**--template react_ts**: The language is Typescript (includes full TypeScript support (tsconfig.json, .tsx files, type checking, etc.)) Provides enterprise-level quality, scalability, IntelliSense, autocompletion, fewer runtime bugs.

build and start application:
```
npm run build
npm run dev
```

### Update the backend applications:
Install cors in express_api and typescript_api:
**CORS**: The React app runs on http://localhost:5173 (Vite default), so the backend must allow cross-origin requests. 
```
npm install cors

# if using TypeScript, also install types
npm install --save-dev @types/cors
```

**CORS (Cross-Origin Resource Sharing)** is a browser security mechanism that controls how web applications running on one origin (domain, protocol, or port) can request resources from a different origin. By default, browsers enforce a same-origin policy, blocking requests from other origins to prevent malicious access to sensitive data. CORS allows a server to explicitly declare which origins are permitted to access its resources by sending specific HTTP headers (Access-Control-Allow-Origin, Access-Control-Allow-Methods, etc.). This way, trusted frontends can interact with APIs hosted on different domains while unauthorized requests are blocked, ensuring both flexibility and security.

Update index.ts file in typescript_api and add ALLOWED_ORIGINS to Dockerfile:
```
// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);  // allow
    } else {
      callback(new Error("Not allowed by CORS"));  // block
    }
  },
  optionsSuccessStatus: 200
}));
```

### Create Dockerfile:
Create docker images and run:
```
docker run --rm --name express_multi_stage_distroless -d -e PORT=3001 -p 3001:3001 express_api_image:0.0.3
docker run --rm -e PORT=3002 -p 3002:3002 --name typescript_api typescript_api_image:0.0.1
```

Create Dockerfile for react_app:
```
docker build -t react_app_image:0.0.1 .
docker run --rm -p 5173:80 --name react_app react_app_image:0.0.1
```

```
CMD ["nginx", "-g", "daemon off;"]
```
**nginx** calls the Nginx binary installed in the container and starts the Nginx web server to serve your static files.
**-g "daemon off;"**
- **-g** allows you to pass a global configuration directive to Nginx.
- **daemon off;** tells Nginx not to run in the background (no daemon mode).
Docker containers run as a single foreground process. If Nginx runs in the background (daemon mode), the main container process exits, and Docker stops the container. Running with daemon off; keeps Nginx in the foreground so the container stays alive.

> Note: If you don’t specify a CMD or ENTRYPOINT in your Dockerfile, Docker uses the default CMD of the base image. For nginx:stable-alpine-slim, the default is: CMD ["nginx", "-g", "daemon off;"]. So even if you omit it, the container still starts Nginx in foreground mode, because that’s what the image defines. 

It’s recommended to explicitly include it. Because it makes your Dockerfile self-contained and clear so anyone reading it sees exactly what command runs and if you later change the base image, you control the behavior.

### Create Dockerfile for dev:

Dockerfile.dev:
```
FROM node:24.10.0-slim AS builder

WORKDIR /app

# Copy package.json and package-lock.json for faster builds
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the source code
COPY . .

# Run the React app (Vite + TS) in dev mode
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

***--host 0.0.0.0***: http://localhost:5173 shows nothing and this is a common issue when running a Vite React dev server inside Docker. By default, Vite’s dev server only listens on localhost (127.0.0.1) inside the container so it’s not accessible from your host machine through Docker port mapping. That’s why even though you mapped ***-p 5173:5173***, your browser can’t connect. The Vite process is listening only inside the container, not on all interfaces. You must tell Vite to listen on all network interfaces (not just localhost).

To fix the problem:
- Option 1: Add ***"--host", "0.0.0.0"*** to Dockerfile.dev
- Option 2: Update package.json with ***"dev": "vite --host 0.0.0.0"***

Create an docker image for development:
```
docker build -t react_app_image:dev -f Dockerfile.dev .
```

Run container for live development:
```
docker run --rm -d -p 5173:5173 -v ./public:/app/public -v ./src:/app/src --name react_app react_app_image:dev
```
The followings are bind mounts (volumes) that map local folders into the container:
- ***-v ./public:/app/public***: ./public on your machine → /app/public in the container
- ***-v ./src:/app/src***: ./src on your machine → /app/src in the container

**Bind mounts** (a type of Docker volume) let you map a directory or file from your host machine into a container’s filesystem, so changes on one side are immediately reflected on the other. This is especially useful in development. For example, you can edit source code on your local machine, and the container instantly sees those changes without rebuilding the image. The syntax ***-v ./src:/app/src*** means “mount the local src folder into /app/src inside the container.” However, bind mounts directly expose your host’s filesystem to the container, so they’re generally used for development, while named volumes are safer and more portable for production data storage.

**Note:** You cannot directly add bind mounts inside a Dockerfile. That’s because bind mounts are a runtime configuration, not part of the image itself. They depend on your local file paths (./src, ./public), which don’t exist inside the image when you build it. (**Dockerfile** defines the image (what’s inside) and ***docker run -v*** defines the container runtime behavior (what to mount, expose, connect, etc.))

# spring_api

Build docker image:
```
docker build -t spring_api_image:0.0.1 .
```

Run the container:
```
docker run -d --rm -p 8080:8080 --name spring_api spring_api_image:0.0.1
```

Test:
```
curl http://localhost:8080
```

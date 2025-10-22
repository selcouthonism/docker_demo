# Docker File
A Dockerfile is essentially a script containing a series of instructions that define how to build a Docker image. Each instruction creates a new layer in the image, and these layers are cached, which makes builds faster and reusable.

## Key Instructions in a Dockerfile
### 1. Base Image
**FROM** specifies the base image. You can start from a lightweight OS (like alpine) or directly from a language runtime (like node:20 or maven:3.9.9-eclipse-temurin-17).
```
FROM ubuntu:22.04
```

### 2. Metadata
Add metadata to the image. It is useful for documentation, automation, and tracking.
```
LABEL maintainer="you@example.com"
LABEL version="1.0"
LABEL description="My app container"
```

### 3. Working Directory
Set the default directory inside the container. Any subsequent command runs relative to this directory.
```
WORKDIR /app
```

### 4. Copying Files
- **COPY** moves files from host to container.
- **ADD** is like **COPY** but also supports remote URLs and automatic archive extraction (less predictable, so COPY is preferred).
```
COPY . /app
ADD config.tar.gz /app/config/
```

### 5. Installing Dependencies
**RUN** executes commands inside the image at build time. It's often used for package installation or compiling code.
Each RUN creates a new layer → better to chain commands to reduce layers.
```
RUN apt-get update && apt-get install -y python3
```

### 6. Environment Variables
Defines environment variables available inside the container. It can be overridden at runtime using docker run -e.
```
ENV APP_ENV=production
```

### 7. Exposing Ports
Documents which port the application listens on. 
```
EXPOSE 8080
```
> Note: Doesn’t actually publish the port; you still need -p 8080:8080 when running.

### 8. Default Commands
Defines the default container start command. Only one **CMD** is allowed per Dockerfile (last one wins). It can be overridden with docker run <image> <command>.
```
CMD ["python3", "app.py"]
```

### 9. Entrypoint
Similar to **CMD**, but harder to override. Best for defining the main binary. **CMD** can then act as arguments to the ENTRYPOINT.
```
ENTRYPOINT ["java", "-jar", "app.jar"]
```

Running → ping google.com:
```
ENTRYPOINT ["ping"]
CMD ["google.com"]
```

### 10. Volumes
Declares mount points for persistent storage. Good for databases, logs, or configs.
```
VOLUME ["/data"]
```

### Best Practices
1. Use lightweight base images (e.g., alpine) unless you need full OS features.
2. Minimize layers: Combine commands with && and use **.dockerignore** to avoid unnecessary files.
3. Pin versions for reproducibility (e.g., python:3.11.6-slim).
4. Separate build and runtime using multi-stage builds to keep final image small and secure.
5. Don’t run as root inside containers → use USER appuser.
6. Keep images small for faster deployment and CI/CD pipelines.
7. Leverage caching: Put frequently changing instructions (like COPY . .) towards the bottom.

A Dockerfile is the blueprint for your image, and writing efficient, secure, and minimal Dockerfiles is critical in DevOps to reduce build times, attack surfaces, and runtime issues.

Sample of Secure Dockerfile for Spring Boot
```
# ----------------------------
# 1. Build stage
# ----------------------------
FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Copy pom.xml and download dependencies first (caching advantage)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code
COPY src ./src

# Build the application (skip tests for faster build in CI/CD)
RUN mvn clean package -DskipTests

# ----------------------------
# 2. Runtime stage
# ----------------------------
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Create a non-root user and group: (groupadd + useradd → creates a system-level user appuser with no login shell.)
RUN groupadd --system appuser && useradd --system --create-home --gid appuser appuser

# Instead of hardcoding a name, you can create a user with fixed UID/GID (often used in Kubernetes or CI/CD for consistency): 
# This ensures the user always has the same ID, even if the name changes. Useful for mounting volumes (permissions match across host & container).
# RUN addgroup --system --gid 1000 appuser && adduser --system --uid 1000 --ingroup appuser appuser

# id -u appuser checks if the user exists. If not, groupadd + useradd runs. If the user already exists, nothing happens.
# RUN id -u appuser &>/dev/null || (groupadd --system appuser && useradd --system --create-home --gid appuser appuser)


# Copy only the JAR from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Change ownership of the app files
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose Spring Boot default port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

```

> Note: If you want to go extra lightweight, we can switch the runtime stage to use JRE-only images (e.g., eclipse-temurin:17-jre-alpine) instead of the full JDK.

## Creating a Docker Image

### docker build
When you use **docker build**, Docker processes each instruction in your Dockerfile layer by layer. If a layer hasn't changed since the last build, Docker can reuse the existing layer from its cache instead of re-executing all the commands for that layer. This is particularly helpful when you're iterating on your code.

For example, if you have a **COPY** instruction for your application code at the end of your Dockerfile, and you only change that code, Docker can reuse all the previous layers (like base image and any installed packages/dependencies would be pulled from the cache) and only rebuild the final layer with your new code. This makes the build process much faster and more efficient for iterative development.

### First hello-world docker image
Create a Dockerfile:
```
FROM ubuntu:latest
CMD ["echo", "Hello from my first Docker image!"]
```

Create a docker image (with the latest tag):
```
docker build -t my-hello-world .
```

- ***-t*** or ***-tag***: Name and optionally a tag (format: name:tag)

Create a docker image (with 0.0.1 tag):
```
docker build -t my-hello-world:0.0.1 .
```

Tag the existing image (with 0.0.2 tag):
```
docker tag my-hello-world:0.0.1 username/my-hello-world:0.0.2
```
The image ID of my-hello-world:0.0.1 and  username/my-hello-world:0.0.2 will be same.


Push image to repository:
```
docker push username/my-hello-world:0.0.2
```

### print-numbers docker image
Create a Dockerfile that prints the numbers 1 to 5 and then exits:
```
FROM busybox:latest
COPY --chmod=755 <<"EOF" /start.sh
echo "Starting..."
for i in $(seq 1 5); do
  echo "$i"
  sleep 1
done
echo "Exiting..."
exit 1
EOF
ENTRYPOINT /start.sh
```

Create a docker image (with 0.0.1 tag):
```
docker build -t print-numbers:0.0.1 .
```

Run docker:
```
docker run -it print-numbers:0.0.1 
```

### nginx docker image
Create Dockerfile:

```
FROM nginx:1.29.2

#RUN apt-get update
#RUN apt-get -y install vim
RUN apt-get update && apt-get -y install vim
```

Create a docker image (with 0.0.1 tag):
```
docker build -t nginx_image:0.0.1 .
```

Run docker:
```
docker run -d -p 80:80 nginx_image:0.0.1
```

Test it:
```
curl http://localhost:80
```

Update index.html and copy it from local machine to docker image:
```
FROM nginx:1.29.2

#RUN apt-get update
#RUN apt-get -y install vim
RUN apt-get update && apt-get -y install vim

#copy file from local machine into docker image
COPY index.html /usr/share/nginx/html/index.html

#RUN chown nginx:nginx /usr/share/nginx/html/index.html
```

Build image and run:
```
docker build -t nginx_image:0.0.2 . &&
docker run -d -p 81:80 nginx_image:0.0.2 
```

Test and see customized index.html:
```
curl http://localhost:81
```

> Note: Do not forget to stop and remove containers and delete images. 
- List: ***docker ps -a***
- Stop all containers: ***docker stop $(docker ps -q)***
- Delete all containers: ***docker rm $(docker ps -aq)***
- Delete all images: ***docker rm $(docker images -q)***



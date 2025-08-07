# Run nginx Docker Image

### What is Docker Official Images?
The Docker Official Images are a curated set of Docker repositories hosted on Docker Hub.

Docker recommends you use the Docker Official Images in your projects. These images have clear documentation, promote best practices, and are regularly updated. Docker Official Images support most common use cases, making them perfect for new Docker users. Advanced users can benefit from more specialized image variants as well as review Docker Official Images as part of your Dockerfile learning process.

To see nginx image go to https://hub.docker.com/_/nginx

### docker pull: Pull images from registry to local
Optinal Step:
```
docker pull nginx:latest
```

***docker pull*** is not needed because ***docker run*** nginx automatically pulls the nginx image if it’s not already available locally. Docker checks your local image cache first; if the image is missing, it fetches it from Docker Hub. This behavior simplifies running containers with fewer commands.

Run nginx docker image:
```
docker run -it --rm -p 8080:80 --name mynginx nginx
```

```
docker run -d --rm -p 8080:80 --name mynginx nginx
```

### docker run: Starts a new container
- **-it**: Allocates an interactive terminal (not really useful with -d)
- **--rm**: Automatically removes the container when it stops
- **-d**: Runs the container in detached mode (in the background)
- **-p 8080:80**: Maps host port 8080 to container port 80 (NGINX default port)
- **--name mynginx**: Names the container mynginx
- **nginx**: The image to run (from Docker Hub if not local)

> Note: **-it** and **-d** are conflicting in most cases. **-it** is for interactive mode; **-d** is for detached. Together, they don’t usually make sense unless you plan to attach later with docker attach.

```
docker run -it --rm -p 8080:80 --name mynginx chainguard/nginx
```
**chainguard/nginx** is a minimal, secure NGINX container image built with a distroless approach—no shell, package manager, or unused libraries. It significantly reduces the attack surface and image size. Ideal for production environments focused on security, it includes only what's necessary to run NGINX, lowering vulnerability exposure.

### docker container ps: List containers
docker container ps lists all running Docker containers. It shows details like container ID, image name, command, uptime, ports, and container name. It's useful for monitoring active containers, checking port mappings, and managing container lifecycles.
```
docker ps -a
```
Add **-a** to view both running and stopped containers.
```
docker container ps -a
```

> Note: When you run the container with **--rm** option, it will automatically removes the container when it stops. The removed containers will not be displayed.

### docker exec: Open interactive Bash shell
```
docker exec -it mynginx bash 
```
Opens an interactive Bash shell inside the running mynginx container. The **-it** flags enable terminal input/output, allowing you to run commands inside the container. This is useful for debugging, inspecting files, or managing the container's environment from within.

```
cat /etc/nginx/conf.d/default.conf 
```
The command displays the contents of the default NGINX server block configuration file inside a container or system. It shows how NGINX is set to handle requests—like ports, server names, root paths, and proxy settings—helpful for understanding or debugging web server behavior.

### curl: Call nginx server
```
curl -v localhost:8080
```

### docker stop: Stop container
```
docker stop mynginx
```

### Help:
docker --help displays a list of Docker's top-level commands and usage options. It guides users on how to interact with Docker, showing commands like run, build, ps, etc. Each command also supports --help for detailed options, making it essential for learning and troubleshooting Docker usage from the CLI.
```
docker --help
```

```
docker run --help
```

```
docker container --help
```

```
docker image --help
```
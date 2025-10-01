# Docker Containers

## Start containers automatically 
Docker provides restart policies to control whether your containers start automatically when they exit, or when Docker restarts. Restart policies start linked containers in the correct order. Docker recommends that you use restart policies, and avoid using process managers to start containers.

- **no**: Don't automatically restart the container. (Default)
- **on-failure[:max-retries]**: Restart the container if it exits due to an error, which manifests as a non-zero exit code. Optionally, limit the number of times the Docker daemon attempts to restart the container using the :max-retries option. The on-failure policy only prompts a restart if the container exits with a failure. It doesn't restart the container if the daemon restarts.
- **always**: Always restart the container if it stops. If it's manually stopped, it's restarted only when Docker daemon restarts or the container itself is manually restarted. (See the second bullet listed in restart policy details)
- **unless-stopped**: Similar to always, except that when the container is stopped (manually or otherwise), it isn't restarted even after Docker daemon restarts.

> Note: You cannot combine ***--rm*** and ***--restart*** flags because they contradict each other. 
- ***--rm***: throw away the container when it exits. Tells Docker: “Automatically remove this container when it exits.” It’s meant for short-lived, temporary containers like alpine for testing.
- ***--restart***: keep the container around and restart it if it exits. Tells Docker: “Restart this container automatically if it stops or Docker restarts.” It’s meant for long-running, persistent services like nginx, mysql.

Run hello-world image. This image just prints a message and exits immediately:
```
docker run --name myworld hello-world
```

Validate the container is not running:
```
docker ps
docker container ls -a
```

Remove container:
```
docker rm myworld
```

Run hello-world image with **unless-stop** flag:
```
docker run --restart unless-stop --name myworld hello-world
```

Check the container status is Restarting:
```
docker ps
```

Stop and remove container:
```
docker stop myworld
docker rm myworld
```


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

### Restart policy with hello-world image
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

### Restart policy with busybox image

#### --restart on-failure
Restart container:
```
docker run -d --name restart_fail --restart on-failure busybox sh -c "sleep 3; exit1"
```
Docker will automatically restart the container only if it exits with a non-zero status code (i.e., it failed).
- ***sh -c "sleep 3; exit 1"*** The container runs a shell command that Waits for 3 seconds (sleep 3), then exits with status code 1 (exit 1), signaling failure.

Docker does not restart the following container:
```
docker run -d --name success --restart on-failure busybox sh -c "sleep 3; exit0"
```
The container runs, sleeps for 3 seconds, and then exits successfully (status code 0). Since the exit code is 0, Docker considers it a normal completion, not a failure. Because the restart policy is on-failure, Docker does not restart the container. The container simply stops after finishing.

Retrieve detailed JSON metadata about a container, image, or volume:
```
docker inspect restart_fail
```

Display the number of times the container has been restarted:
``` 
docker inspect --format='{{.RestartCount}}' restart_fail
```

Limits restarts to a maximum of 5 attempts:
```
docker run -d --name restart_fail --restart on-failure:5 busybox sh -c "sleep 3; exit1"
```
Because the restart policy is on-failure:5, Docker automatically restarts it. This cycle repeats up to 5 times. After the 5th failed attempt, Docker stops trying.

#### --restart always
This restart policy tells Docker to always restart the container, no matter how it exited: 
Whether it fails (exit 1), or finishes successfully (exit 0), or Docker itself restarts after a reboot. Docker will automatically restart this container every time.
```
docker run -d --name restart_always --restart always busybox sh -c "sleep 3; exit0"
```
The container starts and runs sleep 3. After 3 seconds, the command completes with exit 0 (normal exit). Because the restart policy is always, Docker immediately restarts the container again, even though it exited cleanly. This creates an infinite restart loop where the container keeps starting, sleeping, exiting, and restarting. If you manually stop the container with **docker stop restart_always**, Docker stops it temporarily.
However, if the Docker daemon restarts (e.g., system reboot), Docker will automatically start this container again.

#### --restart unless-stopped
Always restart this container unless the user explicitly stops it:
```
docker run -d --name restart_unless_stopped --restart unless-stopped busybox sh -c "sleep 3; exit0"
```
If the container exits for any reason (even exit 0, a successful exit), or Docker restarts (e.g., after a reboot), Docker will automatically start the container again. But if you stop it manually with ***docker stop***, Docker won’t restart it automatically afterward.



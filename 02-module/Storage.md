# Storage

## Volume mounts

Volumes are persistent storage mechanisms managed by the Docker daemon. They retain data even after the containers using them are removed. Volume data is stored on the filesystem on the host, but in order to interact with the data in the volume, you must mount the volume to a container. Directly accessing or interacting with the volume data is unsupported, undefined behavior, and may result in the volume or its data breaking in unexpected ways.

Volumes are ideal for performance-critical data processing and long-term storage needs. Since the storage location is managed on the daemon host, volumes provide the same raw file performance as accessing the host filesystem directly.

### Named and anonymous volumes
A volume may be named or anonymous. Anonymous volumes are given a random name that's guaranteed to be unique within a given Docker host. Just like named volumes, anonymous volumes persist even if you remove the container that uses them, except if you use the --rm flag when creating the container, in which case the anonymous volume associated with the container is destroyed.

If you create multiple containers consecutively that each use anonymous volumes, each container creates its own volume. Anonymous volumes aren't reused or shared between containers automatically. To share an anonymous volume between two or more containers, you must mount the anonymous volume using the random volume ID.

> Note: In general, --mount is preferred. The main difference is that the --mount flag is more explicit and supports all the available options.


Optional Step:

```
docker volume create nginx_volume
```

If you start a container with a volume that doesn't yet exist, Docker creates the volume for you. The following example mounts the volume nginx_volume into /nginx_data/ in the container.

```
docker run -d --rm -p 8080:80 --name mynginx --mount type=volume,src=nginx_volume,target=/nginx_data nginx 
```

Verify that Docker created the read-write mount correctly. Look for the Mounts section:
```
docker inspect mynginx
```

Since volumes are not accessible via the host file system, you need to inspect them through Docker.

Get container ID
```
docker ps
```

Enter inside the running container:
```
docker exec -it <containerId or mynginx> bash
```

Create a file in the running container:
```
echo "Create data inside the nginx container" > nginx_data/container_data.txt
```

Use **docker cp** to copy from a running container using that volume:
```
docker cp <containerId or mynginx>:/nginx_data ./folder-on-host
```

> Note: To save data from a host file into a Docker volume, you can't copy directly to the volume from your host (because volumes live inside Docker's internal filesystem). But you can easily do it using a temporary container. Create a temporary container and save the file in volume. 

List unused Docker volumes:
```
docker volume ls -f dangling=true
```
- ***docker volume ls*** → lists all Docker volumes on your system (volumes are persistent storage areas managed by Docker, not tied to containers directly).
- ***-f*** or ***--filter*** → filters the list of volumes using specific criteria.
- ***dangling=true*** → shows only dangling (unused) volumes (volumes that aren’t currently attached to any container).
- ***-q*** ((quiet mode)) → Outputs only the volume names/IDs, one per line (no headers).


Safely remove unused volumes (Deletes all dangling volumes): 
```
docker volume prune
```
- ***docker volume prune***: Built-in Docker command that removes all dangling volumes. **Asks for confirmation before deleting.**

Deletes all dangling volumes:
```
docker volume rm $(docker volume ls -f dangling=true -q)
```
- Manually deletes all dangling volumes by name. Executes immediately — no prompt.

## Bind mounts

Bind mounts create a direct link between a host system path and a container, allowing access to files or directories stored anywhere on the host. Since they aren't isolated by Docker, both non-Docker processes on the host and container processes can modify the mounted files simultaneously.

Use bind mounts when you need to be able to access files from both the container and the host.

You can use the **readonly** or **ro** option to prevent the container from writing to the mount.
```
docker run --rm -d -p 8080:80 --name mynginx --mount type=bind,src=./nginx_host_data,dst=/nginx_data,ro nginx
```

Enter inside the running container:
```
docker exec -it <containerId or mynginx> bash
```

Read the file:
```
 cat /nginx_data/FileOnHost.txt
```

> Note: Bind mounts are also available for **builds**: you can bind mount source code from the host into the build container to test, lint, or compile a project.

## tmpfs mounts

A tmpfs mount stores files directly in the **host machine's memory**, ensuring the data is not written to disk. This storage is ephemeral: the data is lost when the container is stopped or restarted, or when the host is rebooted. tmpfs mounts do not persist data either on the Docker host or within the container's filesystem.

These mounts are suitable for scenarios requiring temporary, in-memory storage, such as caching intermediate data, handling sensitive information like credentials, or reducing disk I/O. Use tmpfs mounts only when the data does not need to persist beyond the current container session.

> Note: This functionality is only available if you're running Docker on Linux.
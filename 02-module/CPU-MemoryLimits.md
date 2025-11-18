# CPU and MEMORY Limits

## CPU Flags
CPU flags (like ***--cpus***, ***--cpu-shares***, and ***--cpuset-cpus***) let you control how much processing power a container can use. This is crucial for preventing one container from monopolizing CPU resources on a shared host especially in production or multi-service environments. For example, you can limit a background worker to 0.5 CPU so it doesn’t slow down your main web service, or assign specific cores to containers for performance isolation. By capping or pinning CPU usage, you achieve predictable performance, fair resource distribution, and better system stability across all running containers.

Filter CPU flags:
```
docker run --help | grep cpu
```
- ***--cpus=1.5*** → Limit container to 1.5 CPU cores. 
- ***--cpuset-cpus="0,2"*** → Allow the container to run only on cores 0 and 2.
- ***--cpu-shares=512*** → Set relative CPU priority (default 1024).

### --cpus
The --cpus flag in Docker specifies the maximum amount of CPU time a container is allowed to use, expressed in terms of CPU cores. It’s a hard limit, meaning the container cannot exceed the specified fraction of total CPU resources. For example, ***--cpus=1*** restricts the container to one full CPU core’s worth of processing time, while ***--cpus=0.5*** gives it only half a core which effectively throttling it. This flag is especially useful when running multiple containers on the same host, as it prevents any single container from consuming excessive CPU and ensures fair resource allocation, predictable performance, and better stability across all workloads. Unlike ***--cpu-shares*** (which is relative priority), ***--cpus*** enforces a strict CPU quota, making it ideal for production environments.

```
docker run --rm -d --name cpu_decimals --cpus=1 busybox sh -c "while true; do :; done"
```
This restricts the container to use at most one full CPU core’s worth of processing time, even if the host has multiple cores. Perfect for lightweight web services or background jobs that shouldn’t hog the CPU.

- busybox is lightweight BusyBox image (a minimal Linux system) which is perfect for quick tests since it’s small and fast.
Perfect for quick tests since it’s small and fast.
- ***sh -c "while true; do :; done"*** runs a simple infinite shell loop (while true), where : is a no-op (does nothing but keeps the CPU busy).

```
docker run --rm -d --name cpu_decimals --cpus=0.5 busybox sh -c "while true; do :; done"
```
This limits the container to half a CPU core, effectively throttling it. Useful for small worker tasks, log processors, or monitoring agents that don’t need full CPU performance.

### --cpuset-cpus
The ***--cpuset-cpus*** flag in Docker lets you pin a container to specific CPU cores on the host machine. Instead of limiting how much CPU time a container can use (like ***--cpus*** does), it limits which CPUs the container is allowed to run on. For example, ***--cpuset-cpus="0,2"*** means the container’s processes will only run on CPU cores 0 and 2, while ***--cpuset-cpus="1-3"*** allows it to run on cores 1, 2, and 3. This is especially useful for performance optimization and isolation. For instance, dedicating certain cores to database containers or compute-heavy services to reduce context switching and ensure more consistent performance. In short, ***--cpuset-cpus*** gives you fine-grained control over CPU affinity, helping improve efficiency in multi-core or multi-container environments.
```
docker run --rm -d --name cpu_cores --cpuset-cpus="0,2" busybox sh -c "while true; do :; done"
```
This binds the container to run only on CPU cores 0 and 2. It’s often used in performance-sensitive systems (like databases or low-latency apps) to avoid context switching and achieve CPU isolation.

### Combine both — limit and pin
```
docker run --rm -d --name cpu_combine --cpus=1.5 --cpuset-cpus="1-3" busybox sh -c "while true; do :; done"
```
This allows up to 1.5 CPUs worth of time, but only on cores 1 through 3. It gives flexibility (use multiple cores) while maintaining a strict cap on total CPU consumption.

### --cpu-shares
The ***--cpu-shares*** flag in Docker sets a relative weight or priority for CPU allocation among containers. It is not a hard limit. It determines how much CPU time a container should get when CPU resources are contested. The default value is 1024, so if you start one container with ***--cpu-shares=512*** and another with ***--cpu-shares=1024***, the second container will receive twice as much CPU time as the first when both are busy. However, if only one container is running, it can still use the full CPU regardless of its share value. This makes ***--cpu-shares*** useful for prioritizing workloads (e.g., giving a web API higher priority than a background logger), while still allowing flexibility when the system isn’t under heavy load. In essence, it’s a soft allocation mechanism and it influences scheduling fairness but doesn’t enforce strict CPU limits.
```
docker run --rm -d --name app_cpu_shares_low --cpu-shares=512 busybox sh -c "while true; do :; done"
docker run --rm -d **name app_cpu_shares_high --cpu-shares=2048 busybox sh -c "while true; do :; done"
```
***--cpu-shares*** doesn’t set a hard limit but it sets priority. When CPU is contested, the container with higher shares (2048) gets more CPU time than one with fewer shares (512). Great for tiered workloads.

### docker stats
```
docker stats
```
The ***docker stats*** command shows real-time resource usage metrics for running containers, similar to a “task manager” or “top” command but specifically for Docker. When you run docker stats, it continuously displays live data such as CPU usage, memory consumption, network I/O, block I/O, and PIDs (process counts) for each container. This helps you monitor performance, detect resource bottlenecks, and verify that your CPU and memory limits are working as expected. For example, you might see a container using 80% CPU or close to its memory cap (clear signs it may need optimization or more resources). You can also use flags like ***docker stats <container_name>*** to monitor a specific container, or ***--no-stream*** to show a single snapshot instead of live updates. In short, docker stats is a powerful real-time monitoring tool that helps ensure your containers run efficiently and stay within resource boundaries.

## MEMORY Flags
Memory flags (like ***--memory*** and ***--memory-swap***) define the maximum amount of RAM a container can consume. This is vital because, without limits, a memory-hungry process could consume all available RAM, causing the Docker host to slow down or crash. Setting memory constraints ensures that containers stay within safe usage bounds and prevents the operating system from killing processes unexpectedly (via the OOM killer). In short, memory limits are key for system reliability, isolation, and preventing resource exhaustion in containerized environments.

Filter memory flags:
```
docker run --help | grep memory
```

### --memory
The ***--memory*** flag in Docker sets a hard limit on how much RAM a container can use. For example, ***--memory=512m*** restricts the container to 512 megabytes of memory. If it tries to use more, the Linux kernel’s Out-Of-Memory (OOM) killer will terminate processes inside the container. This flag is crucial for maintaining system stability and resource isolation, especially when multiple containers share the same host. Without memory limits, one memory-intensive container could consume all available RAM, potentially crashing the entire system. By setting a memory cap, you ensure that each container stays within its allowed budget, improving predictability, preventing resource exhaustion, and keeping other containers and the host healthy. You can also combine it with ***--memory-swap*** to control swap usage, giving you fine-grained control over memory behavior in production.

```
docker run --rm -d --name mongodb mongodb/mongodb-community-server:7.0-ubuntu2204
```

The mongodb docker image require at least 85MB, the following will throw Out-Of-Memory:
```
docker run --rm -d --memory=20m --name mongodb mongodb/mongodb-community-server:7.0-ubuntu2204
```
***--memory=20m*** is very low for MongoDB. It will crash or fail to start due to memory exhaustion.

### --memory-reservation
The ***--memory-reservation*** flag in Docker sets a soft limit for a container’s memory usage It’s a threshold rather than a hard cap. Unlike ***--memory***, which strictly prevents a container from using more than a set amount, ***--memory-reservation*** simply tells the Docker scheduler to try to keep the container’s memory usage below that value when possible. If the host system has plenty of available memory, the container can exceed this reservation without penalty; but if the host is under memory pressure, containers exceeding their reservation are more likely to have their memory reclaimed or even be terminated (if also over their hard limit).

```
docker run --memory=512m --memory-reservation=256m my_app
```
This means the container should ideally use 256 MB or less, but it can go up to 512 MB if needed. 

In short, --memory-reservation provides a flexible performance guideline, helping Docker manage resources more efficiently under load, ensuring fair sharing while avoiding abrupt OOM kills unless absolutely necessary.

```
docker run --rm -d --memory-reservation=100m --memory=200m --name mongodb mongodb/mongodb-community-server:7.0-ubuntu2204
```

### --memory-swap
The ***--memory-swap*** flag in Docker controls how much total memory (RAM + swap) a container can use, allowing you to fine-tune its memory behavior beyond the ***--memory*** limit. For example, if you set ***--memory=512m --memory-swap=1g***, the container can use 512 MB of physical RAM plus 512 MB of swap space, for a total of 1 GB. If you set ***--memory-swap*** equal to ***--memory***, swap is effectively disabled, forcing the container to stay strictly within its RAM limit. Setting ***--memory-swap=-1*** removes the swap limit, letting the container use as much swap as the host allows (not recommended for production). This flag is important because swap acts as an overflow for memory. It prevents crashes when memory spikes occur but can severely slow performance. In short, ***--memory-swap*** helps balance performance stability vs. flexibility, allowing containers to temporarily exceed RAM limits without overwhelming the host.

```
docker run --rm -d --memory=100m --memory-swap=1g --name mongodb mongodb/mongodb-community-server:7.0-ubuntu2204
```
- ***--memory=100m*** sets a hard limit of 100 MB of RAM for the MongoDB container. If MongoDB tries to use more, it may be throttled or killed by the kernel (OOM killer).
- ***--memory-swap=1g*** allows up to 1 GB total memory usage (RAM + swap). Since memory=100m, this means MongoDB can use 100 MB of physical RAM and up to 900 MB of swap space if available. Swap acts as overflow, slower but prevents immediate crashes under pressure.

### docker inspect
The docker inspect command displays detailed, low-level information about Docker objects such as containers, images, networks, or volumes in JSON format. It’s essentially a diagnostic and debugging tool that reveals everything Docker knows about a resource, including configuration details, environment variables, mount points, network settings, IP addresses, resource limits, and runtime state.

```
docker inspect my_container
```
returns a structured JSON document showing properties like the container’s image ID, ports, volumes, restart policy, and more. You can also extract specific fields using the ***--format*** option, such as:
```
docker inspect --format='{{.NetworkSettings.IPAddress}}' my_container
```
to get just the container’s IP address.

In short, ***docker inspect*** gives you deep visibility and precise metadata about Docker objects. It’s invaluable for troubleshooting, verifying configurations, and integrating Docker data into automation scripts or monitoring systems.

#### docker inspect mongodb
The mongodb docker image require at least 85MB, the following will throw Out-Of-Memory:
```
docker run -d --memory=20m --name mongodb mongodb/mongodb-community-server:7.0-ubuntu2204
```

Display the OOMKilled flag (will be true in this case):
```
docker inspect mongodb --format='{{.State.OOMKilled}}'
```


#### Host system's responsiveness or stability!
Can you think of a type of workload or process that, even within its allocated CPU and memory limits, could still negatively impact the host system's responsiveness or stability?

Sometimes it helps to think about what a container does with its resources. Even if a container is limited to, say, 0.5 CPU cores, what if it's constantly using that 0.5 CPU core to perform a very intensive, continuous calculation? Or what if it's frequently writing and reading small files to disk, even if its memory usage is within limits?

Let's think about it this way: even if a container is given a specific amount of CPU and memory, the way it uses those resources can still be problematic. 

Consider a container running a process that, while staying within its CPU limit, constantly performs very frequent and small disk I/O operations. Even if it's not exceeding its allocated CPU time, these constant disk operations can still put a significant strain on the host's disk subsystem, potentially slowing down other processes on the host that also need to access the disk.

Another example could be a process that, while staying within its memory limit, frequently allocates and deallocates large chunks of memory, leading to memory fragmentation on the host. 

So, even with limits, the nature of the workload can be important. 

Let's consider a container running a CPU-intensive test process. Even if you set --cpus 0.5, meaning it can only use half a CPU core, if this process is constantly trying to use that half-core to its absolute maximum, it can still impact the host. While it won't exceed its allocated CPU, the continuous, high-demand usage can still lead to increased host CPU temperature, fan noise, and potentially reduce the responsiveness of other processes that are also trying to share the remaining CPU resources on the host.

It's a subtle point, but an important one for understanding resource management. You might observe the host system becoming generally sluggish or less responsive, even if the container itself isn't technically exceeding its allocated CPU limit. Other applications running directly on the host might feel slower, or the host's own system processes might take longer to execute.

This highlights that setting limits is crucial, but understanding the nature of the workload within those limits is also key. 


# Networking
Docker networking allows containers to communicate with each other, the host machine, and external systems in a controlled and isolated way. When Docker runs a container, it connects it to a virtual network — by default, the bridge network — which provides each container with its own IP address and hostname within a private subnet. This means containers can talk to one another using container names instead of IPs, while remaining isolated from the host and other networks unless explicitly connected. Docker also supports other built-in network drivers such as host (shares the host’s network stack), none (no networking), and overlay (for multi-host communication across Docker Swarm or Kubernetes clusters).

Networking is crucial for designing microservices architectures, where each service runs in its own container but needs to communicate securely and efficiently with others. Developers can create custom user-defined networks to control how containers discover and talk to each other, use port mapping (-p) to expose services to the host or internet, and define network aliases for clean service discovery. By isolating traffic and managing connectivity at the network layer, Docker enables scalable, modular, and secure application deployment - allowing containers to function like lightweight, networked services within a virtualized ecosystem.

## Network Drivers
Docker provides several network drivers, each designed for specific connectivity and isolation needs:

### Bridge (default): 
The most common driver for standalone containers. It creates an internal private network on the host, and containers connected to it can communicate with each other via internal IPs or container names. You can expose container ports to the host using -p (e.g., -p 8080:80) for external access.

#### Step 1: Run nginx
```
docker run --rm -d --name web-server nginx
```
This starts a detached (-d) Nginx web server container named web-server using the default bridge network. In this network mode, Docker assigns each container its own private IP address (e.g., 172.17.0.2) inside an isolated virtual network. The container isn’t automatically reachable by other containers unless they’re connected to the same network.

#### Step 2: Run ubuntu
```
docker run --rm -it --name ubuntu alpine:3.22 sh
```
This runs an interactive Alpine shell container, also on Docker’s default bridge network. However, since it’s a **separate network namespace**, it cannot reach other containers by name (like web-server) unless both containers are on a user-defined network that supports built-in DNS-based name resolution.

#### Step 3: Install curl
```
apk add curl
```
Inside the Alpine container, you install curl to test network connections. Alpine uses the apk package manager (lightweight alternative to apt or yum).

#### Step 4: Call nginx with docker name in ubuntu - returns nothing
```
curl web-server
```
This returns nothing because web-server isn’t resolvable by name on the default bridge network. Docker’s internal DNS resolver only works for **user-defined bridge networks**, not the default bridge. So the container doesn’t know where web-server is.

#### Step 5: Inspect web-server container to find the IP address
```
docker inspect web-server
```
This command retrieves detailed information about the Nginx container, including its internal IP address (for example, 172.17.0.2) under the NetworkSettings section. This IP is how other containers on the same host can reach it (if they’re on the same network).

#### Step 6: Call with IP address of web-server container from ubuntu - returns html
```
curl 172.17.0.2
```
When you curl using the direct IP address, it works. Nginx responds with its default HTML page. This confirms that network-level connectivity exists, but DNS-based container name resolution doesn’t on the default bridge.

### Host: 
Removes network isolation between the container and the host. The container shares the host’s networking stack, meaning it uses the same IP address and ports as the host (you need to be careful about port conflicts). This gives better performance but eliminates container-level network isolation, useful for performance-critical or system-level applications.

When a container uses the host network mode, it essentially becomes an extension of the host machine's network. This means:

- **Reduced Security**: The container can access all network interfaces on the host and potentially intercept traffic meant for other services on the host. It also means that if a vulnerability exists in the containerized application, it could be exploited to gain access to the host's network directly, bypassing the usual network isolation layers Docker provides.
- **Port Conflicts**: If a container tries to bind to a port that is already in use on the host, it will fail. This makes managing port assignments more complex, especially when running multiple containers or services on the same host.
- **Less Portability**: The container's network configuration becomes tightly coupled to the host's network configuration. This can make it harder to move the container to a different host, as you'd need to ensure the new host has compatible network settings and available ports.

While the host network mode has its downsides, there are specific situations where its benefits outweigh the risks. Think about applications that need extremely high network performance or very low latency, or those that need to directly access network services on the host without any translation or bridging. Let's consider applications where every millisecond of network speed counts, or where there's a need to handle a massive amount of network traffic directly. Think about high-performance proxies, network monitoring tools, or certain types of load balancers. These applications often benefit from the host network mode because it eliminates the overhead of network address translation (NAT) and bridge networking, allowing them to achieve near bare-metal network performance.


### None: 
Completely disables networking for the container. The container has no access to any network interfaces except lo (loopback). This mode is used for security-sensitive tasks or offline workloads where network access isn’t needed.

### Overlay: 
Enables containers on different Docker hosts (in a Swarm or Kubernetes cluster) to communicate securely over a distributed network. It abstracts the physical network and creates a virtual network layer that spans multiple machines. It is ideal for scaling microservices across clusters.

### Macvlan: 
Assigns containers their own MAC addresses, making them appear as physical devices on the host’s local network. This allows containers to communicate directly with external networks as if they were independent machines. It is commonly used for legacy applications that need to be on the same Layer 2 network.

### IPvlan (less common): 
Similar to Macvlan but with simpler configuration and less broadcast overhead. It gives containers IP addresses directly on the host’s network and is often used in advanced networking setups or performance-optimized environments.

## Create user-defined network
This sequence of steps demonstrates how user-defined Docker networks enable containers to discover and communicate with each other by name, not just by IP.

#### Step 1: Create network
```
docker network create --help
```

```
docker network create app_net
```
Here you create a user-defined bridge network called app_net. Unlike the default bridge, user-defined networks provide built-in DNS resolution, meaning containers attached to the same network can find each other by container name. This is essential for microservices and multi-container setups (e.g., React frontend ↔ backend API).

#### Step 2: Run nginx
```
docker run --rm -d --name web-server nginx
```
You start an Nginx container named web-server. By default, it joins the default bridge network, not app_net. So at this point, it can only be reached by IP from other containers on the same bridge.

#### Step 3: Run ubuntu
```
docker run --rm -it --name ubuntu alpine:3.22 sh
```
You launch an interactive Alpine container named ubuntu. Like web-server, it’s initially attached to the default bridge network — which means it cannot resolve web-server by name yet.

#### Step 4: Install curl
```
apk add curl
```
You install curl inside the Alpine container to test HTTP connectivity. apk is Alpine’s package manager.

#### Step 5: Connect both containers to the same network
```
docker network connect --help
```

```
docker network connect webserver app_net
docker network connect ubuntu app_net
```
These commands attach both containers to the app_net user-defined network. Containers can belong to multiple networks, so now each container is on both the default bridge and app_net. Once they share app_net, Docker’s internal DNS automatically lets them resolve each other’s names (e.g., web-server).

#### Step 6: Verify network connections (Verify both containers connected to app_net network)
```
docker network inspect app_net
```
This displays all containers attached to app_net, along with their assigned IP addresses (e.g., 172.18.x.x). You should see both web-server and ubuntu listed under Containers, confirming they’re connected to the same virtual network.

#### Step 7: Test communication by container name (Call nginx with docker name in ubuntu - returns html)
```
curl web-server
```
Now, inside the Alpine container, you can reach Nginx simply by its container name and you get back Nginx’s default HTML page. This works because Docker’s embedded DNS service resolves web-server container’s internal IP on app_net.

#### Step 8: Verify with IP address (Inspect web-server container to find the IP address)
```
docker inspect web-server
curl 172.17.0.2
```
When you inspect the container, you’ll see both IP addresses. One for the default bridge and one for app_net. Curling the correct IP from inside the Alpine container also works, proving network-level connectivity.


In summary, containers on the default bridge can talk by IP, not by name (containers can’t resolve each other by name). Containers on a user-defined network can talk both by name and by IP (Docker provides automatic name resolution and better isolation). This is why production-grade Docker setups (or Docker Compose stacks) almost always use custom networks, so containers like frontend, backend, and db can communicate simply by service name (e.g., curl backend:8080).

# Projects
- [MongoDB](#mongodb)
- [Express API](#express-api)
- [Automate with scripts](#automate-with-scripts)
- [Automate with Docker Compose](#automate-with-docker-compose)

## MongoDB

Run MongoDB Docker Container:
```
docker run -d --name mongodb mongodb/mongodb-community-server:7.0-ubuntu2204
```
This command starts a MongoDB database server inside a Docker container in detached mode (-d). After running this command, MongoDB starts running in the background inside the container and listens on its default port (27017).

- MongoDB documentation: https://www.mongodb.com/docs/

View the log output of a running (or stopped) Docker container:
```
docker logs mongodb
```
For a MongoDB container, the logs typically include messages such as:
- The startup process (initialization, version, and storage engine details)
- Connection status and network binding
- Warnings or errors during operation
- Shutdown messages when the container stops

This command is very useful for debugging. For example, if MongoDB fails to start properly, docker logs mongodb will show you the reason (like missing environment variables, permission issues, or configuration errors).

You can also add flags for more control:
- ***docker logs -f mongodb***→ follow mode, streams logs live (like tail -f).
- ***docker logs --tail 50 mongodb*** → shows only the last 50 lines.

Connect to MongoDB Shell:
```
docker exec -it mongodb mongosh
```
This command opens an interactive MongoDB shell session (mongosh) inside the running container named mongodb.
- ***docker exec*** lets you run a command inside an existing container.
- ***-it*** enables interactive mode, allowing you to type commands directly into the Mongo shell.

Once inside, you can execute MongoDB commands as if MongoDB were installed directly on your machine.

Explore MongoDB Databases:
```
show dbs;
use admin;
show colloctions;
```
These are Mongo shell commands to interact with the database:
- ***show dbs;*** lists all databases currently available in the MongoDB instance.
- ***use admin;*** switches the active database to the admin database (which is a built-in administrative DB).
- ***show collections;*** lists all collections (similar to tables in relational databases) within the currently selected database.

Remove container:
```
docker rm -f mongodb
```
### Setup MongoDB

#### Step 1: Creating and making shell scripts executable:
```
touch start-db.sh
chmod +x start-db.sh
touch cleanup.sh
chmod +x cleanup.sh
```
**start-db.sh** — used to start or configure the MongoDB container.
**cleanup.sh** — used to stop and remove containers, networks, or volumes when cleaning up.

#### Step 2: mongo-init.js auto-execution
If a file named mongo-init.js (or placed under /docker-entrypoint-initdb.d/ in the container) exists, the official MongoDB Docker image will automatically execute it the first time the container starts. This file typically contains initialization logic. For example, creating databases, users, or collections automatically at startup. (mongo-init.js will be picked by mongodb server during startup time)

mongo-init.js:
```
const keyValueDb = process.env.KEY_VALUE_DB;
const keyValueUser = process.env.KEY_VALUE_USER;
const keyValuePassword = process.env.KEY_VALUE_PASSWORD;

db = db.getSiblingDB(keyValueDb);

db.createUser(
    {
        user: keyValueUser,
        pwd: keyValuePassword,
        roles: [
            {
                role: 'readWrite',
                db: keyValueDb
            }
        ]
    }
)
```

#### Step 3: Creating a Docker volume and network
```
docker volume create key-value-data
docker network create key-value-net
```
The volume (key-value-data) is used to persist MongoDB data outside the container — so even if the container is deleted, your database files remain safe.

The network (key-value-net) allows containers (like MongoDB and debugging shells) to communicate securely by name (e.g., mongodb) without exposing ports to the host machine.

#### Step 4: Starting the MongoDB container
start-db.sh:
```
MONGODB_IMAGE="mongodb/mongodb-community-server"
MONGODB_TAG="7.0-ubuntu2204"
CONTAINER_NAME="mongodb"

# Root creadentials
ROOT_USER="root-user"
ROOT_PASSWORD="root-password"

# Key-Value Credentials
KEY_VALUE_DB="key-value-db"
KEY_VALUE_USER="key-value-user"
KEY_VALUE_PASSWORD="key-value-password"

# Connectivity
LOCALHOST_PORT=27017
CONTAINER_PORT=27017
NETWORK_NAME="key-value-net"

# Storage
VOLUME_NAME="key-value-data"
VOLUME_CONTAINER_PATH="/data/db"

docker run --rm -d --name $CONTAINER_NAME \
    -e MONGODB_INITDB_ROOT_USERNAME=$ROOT_USER \
    -e MONGODB_INITDB_ROOT_PASSWORD=$ROOT_PASSWORD \
    -e KEY_VALUE_DB=$KEY_VALUE_DB \
    -e KEY_VALUE_USER=$KEY_VALUE_USER \
    -e KEY_VALUE_PASSWORD=$KEY_VALUE_PASSWORD \
    -p $LOCALHOST_PORT:$CONTAINER_PORT \
    -v $VOLUME_NAME:$VOLUME_CONTAINER_PATH \
    -v ./db-config/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro \
    --network $NETWORK_NAME \
    $MONGODB_IMAGE:$MONGODB_TAG

```

```
./start-db.sh
```
This runs the MongoDB server inside a container that’s attached to the key-value-net network and stores its data in the key-value-data volume.

#### Step 5: Connecting to MongoDB inside the same network (mongodb runs in the  key-value-net thus we can connect it):
```
docker run --rm --name debugsh -it --network key-value-net mongodb/mongodb-community-server:7.0-ubuntu2204 mongosh mongodb://mongodb/key-value-db
```
Here, you run a temporary MongoDB shell container (debugsh) that connects to the MongoDB server (mongodb) using its container name as a hostname. Since both containers share the same Docker network (key-value-net), DNS resolution works automatically.

#### Step 6: Connecting with authentication (Connect with username(key-value-user) and passsword(key-value-password))
```
docker run --rm --name debugsh -it --network key-value-net mongodb/mongodb-community-server:7.0-ubuntu2204 mongosh mongodb://key-value-user:key-value-password@mongodb/key-value-db
```
This command is similar to the previous one but includes: A username (key-value-user) and password (key-value-password) and the target database name (key-value-db). This demonstrates how to connect securely to MongoDB using credentials which is essential for production setups.

### Refactor MongoDB script:

#### Step 1: Create .env files for configuration
Define three environment configuration files to store reusable variables:

**.env.network**: Defines a reusable Docker network name for container communication.
```
export NETWORK_NAME="key-value-net"
```

**.env.volume**: Stores the name of the volume that persists MongoDB data.
```
export VOLUME_NAME="key-value-data"
```

**.env.db**: Defines the MongoDB container name.
```
export DB_CONTAINER_NAME="mongodb"
```

Separating configurations into .env files makes your scripts modular, maintainable, and environment-independent. Instead of hardcoding values in multiple scripts, you can easily change them in one place.

#### Step 2: Create setup.sh
This script prepares the Docker environment (volume and network):
```
# Responsible for creating volumes and networks

source .env.network
source .env.volume

if [ "$(docker volume ls -q -f name=$VOLUME_NAME)" ]; then
    echo "A volume with the name $VOLUME_NAME already exists. Skipping volume creation."
else
    docker volume create $VOLUME_NAME
fi

if [ "$(docker network ls -q -f name=$NETWORK_NAME)" ]; then
    echo "A network with the name $NETWORK_NAME already exists. Skipping network creation."
else
    docker network create $NETWORK_NAME
fi
```
Loads variables from .env files into the shell. Then it checks if the volume and network already exist before creating them.

This prevents accidental duplication of Docker resources and ensures your setup process is idempotent — running it multiple times won’t cause errors or duplicate entities.

Make the script executable:
```
chmod +x setup.sh
```

#### Step 3: Update start-db.sh
The startup script now includes environment variables and the setup process:
```
source .env.db
source .env.network
source .env.volume
source setup.sh
```
This ensures all necessary configuration and infrastructure are loaded before MongoDB starts.

It also checks whether a MongoDB container with the same name is already running:
```
if [ "$(docker ps -q -f name=$CONTAINER_NAME)" ]; then
    echo "A container with the name $CONTAINER_NAME already exists."
    echo "The container will be removed when stopped."
    echo "To stop the container, run: docker stop $CONTAINER_NAME"
    exit 1
fi
```

This prevents conflicts by ensuring you don’t start a second MongoDB container with the same name. It also provides clear user feedback and guidance.

#### Step 4: Create cleanup.sh
This script stops and removes MongoDB containers, networks, and volumes safely:
```
source .env.db
source .env.network
source .env.volume

# Stop and remove mongodb containers

if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Stopping volume $CONTAINER_NAME"
    docker stop $CONTAINER_NAME #&& docker rm $CONTAINER_NAME #Add if the container is not running with --rm 
else
    echo "A container with the name $CONTAINER_NAME does not exists. Skipping container deletion."
fi

# Remove volume and network

if [ "$(docker volume ls -q -f name=$VOLUME_NAME)" ]; then 
    echo "Removing volume $VOLUME_NAME"
    docker volume rm $VOLUME_NAME
else
    echo "A volume with the name $VOLUME_NAME does not exists. Skipping volume deletion."
fi

if [ "$(docker network ls -q -f name=$NETWORK_NAME)" ]; then
    echo "Removing network $NETWORK_NAME"
    docker network rm $NETWORK_NAME
else
    echo "A network with the name $NETWORK_NAME does not exists. Skipping network deletion."
fi
```
Stops the MongoDB container if it exists. Removes the associated volume and network.

Ensures a clean teardown of the Docker environment, removing any persistent data or networking setup to return the system to a clean state.
It includes safety checks so it won’t fail if a resource doesn’t exist.

## Express API

### Create an express project

#### Initialize a Node.js project and install dependencies:
```
npm init -y
npm install express@5.1.0 mongoose@8.19.3 --save-exact
```
- **npm init -y** automatically generates a default package.json file.
- **express@5.1.0** installs the latest stable version of Express 5 (for REST APIs).
- **mongoose@8.19.3** installs a MongoDB ODM compatible with MongoDB 7.
- The **--save-exact** flag locks versions precisely, ensuring consistent builds across environments.

Install nodemon (development only) for hot reloading:
```
npm install --save-dev --save-exact nodemon@3.1.10
```
- **--save-dev** Installs nodemon as a development dependency, meaning it’s not needed in production (it’s used only for local development and debugging).
- **--save-exact** Locks the exact version number in package.json (for example, "nodemon": "3.1.7") instead of a range like "^3.1.7".
This ensures everyone on your team or CI/CD pipeline runs the exact same nodemon version, avoiding version drift or unexpected behavior.

#### Create the Docker Image
Build a Docker image specifically for development:
```
docker build -t express_backend_image:dev -f Dockerfile.dev .
```
- **-t express_backend_image:dev** names and tags the image.
- **-f Dockerfile.dev** tells Docker to use the development-specific Dockerfile (often includes nodemon, volume mounts, etc.).
- **.** defines the build context as the current directory.

This creates a reproducible environment to run the Express app in a containerized setup.

#### Run the Express Container
Run the image as a container and connect it to your MongoDB network ():
```
docker run --rm -d --network key-value-net -p 3000:3000 --name express_backend express_backend_image:dev
```
- **--rm** removes the container automatically when stopped.
- **-d** runs it in detached (background) mode.
- **--network key-value-net** connects it to the same Docker network as MongoDB, enabling hostname-based access.
- **-p 3000:3000** maps port 3000 of the container to port 3000 on your host machine.
- **--name express_backend** assigns a friendly container name for easier reference.

## Automate with scripts

#### Automate with start-backend.sh
This script automates the build and run steps, ensuring configuration consistency. 
Create start-backend.sh and change its mode (**chmod +x start-backend.sh**):
```
#Loads environment variables for database credentials and network name.
source .env.db
source .env.network

#Defines reusable variables for container configuration and connectivity.
BACKEND_IMAGE_NAME='express_backend_image'
BACKEND_IMAGE_TAG='dev'
BACKEND_CONTAINER_NAME='express_backend'

# Connectivity
LOCALHOST_PORT=3000
CONTAINER_PORT=3000

MONGODB_HOST='mongodb'

#Prevents duplicate containers by checking if one with the same name is already running.
if [ "$(docker ps -aq -f name=$BACKEND_CONTAINER_NAME)" ]; then
    echo "A container with the name $BACKEND_CONTAINER_NAME already exists."
    echo "The container will be removed when stopped."
    echo "To stop the container, run: docker stop $BACKEND_CONTAINER_NAME"
    exit 1
fi

#Builds the Docker image using the specified Dockerfile in the express_api folder.
docker build -t $BACKEND_IMAGE_NAME:$BACKEND_IMAGE_TAG -f ../express_api/Dockerfile.dev express_api

docker run --rm -d --name $BACKEND_CONTAINER_NAME \
    -e KEY_VALUE_DB=$KEY_VALUE_DB \
    -e KEY_VALUE_USER=$KEY_VALUE_USER \
    -e KEY_VALUE_PASSWORD=$KEY_VALUE_PASSWORD \
    -e PORT=$CONTAINER_PORT \
    -e MONGODB_HOST=$MONGODB_HOST \
    -p $LOCALHOST_PORT:$CONTAINER_PORT \
    -v ../express_api/src:/app/src \
    --network $NETWORK_NAME \
    $BACKEND_IMAGE_NAME:$BACKEND_IMAGE_TAG
```

This ensures the backend container: Connects securely to MongoDB using credentials and runs isolated but network-accessible within the Docker environment. It can be rebuilt or restarted easily without manual cleanup. (First run start-db.sh then start-backend.sh)

Express and MongoDB stack launches in isolated containers connected via **key-value-net**. You can now access the backend API at: http://localhost:3000

#### Test application
Go to scripts folder and run start-db.sh:
```
./start-db.sh
```
This script sets up and starts your MongoDB container. It reads environment variables (from .env.db, .env.network, and .env.volume), ensures the necessary Docker volume and network exist, and then launches MongoDB inside the Docker network (key-value-net).
This ensures that your database has persistent storage and is reachable by name (mongodb) from other containers like your backend API.

Run start-backend.sh script:
```
./start-backend.sh
```
This script builds and runs the Express backend container. It connects the container to the same Docker network (key-value-net) so that it can communicate with MongoDB using the hostname mongodb. It passes environment variables such as:
**KEY_VALUE_DB**, **KEY_VALUE_USER**, **KEY_VALUE_PASSWORD** for database credentials, and **PORT** / **MONGODB_HOST** for service configuration. After starting, the Express server listens on port 3000, exposed to your host system at localhost:3000.

Test the API:
```
curl -i -X POST http://localhost:3000/store -H "Content-Type: application/json" -d '{"key":"hello", "value":"world"}'
```
This curl command sends an HTTP POST request to your running Express API. It attempts to store a key–value pair ("hello", "world") in MongoDB through the backend endpoint /store. 
- The **-i** flag includes response headers in the output. 
- The **-X POST** flag specifies the HTTP method.

If everything is working, you should see a 201 Created response, confirming that your backend and MongoDB are connected and functional.

Retrieve a value by key:
```
curl -i -X GET http://localhost:3000/store/hello
```
This sends a GET request to your backend API, asking for the value associated with the key "hello".
The backend looks up the key "hello" in MongoDB. If found, it returns the stored value ("world") with an HTTP 200 OK status.
If not found, it responds with a 404 Not Found.


Update an existing key:
```
curl -i -X PUT http://localhost:3000/store/hello -H "Content-Type: application/json" -d '{"value":"universe"}'
```
This sends a PUT request to update the existing key "hello" in your database. The JSON body specifies the new value: "universe".
The backend finds the record for "hello" and updates its value in MongoDB. A successful update returns 200 OK. If the key doesn’t exist, the API return an error (404 Not Found).

Delete a key:
```
curl -i -X DELETE http://localhost:3000/store/hello
```
This sends a DELETE request to remove the key "hello" and its value from MongoDB. If the deletion is successful, you should see a 204 No Content response. If the key doesn’t exist, the API returns 404 Not Found.

## Automate with Docker Compose
Docker Compose is a tool that allows you to define and manage multi-container Docker applications using a single configuration file, typically named **docker-compose.yml** or **compose.yaml**. With Compose, you can declare your application’s services, networks, and volumes in a structured way, and then start everything with a single command ***docker-compose up***.
- **Services**: Each containerized component of your application (Express API, MongoDB) is defined as a service.
- **Networks**: Compose automatically creates a network so services can communicate with each other.
- **Volumes**: Persistent storage can be attached to containers to retain data between restarts.
- **Environment variables**: You can load *.env* files to configure services dynamically.
- **Automation**: Compose simplifies building, running, and scaling multi-container applications without manually starting each container.

### Starts containers, using existing images if available:
```
docker compose up
```
The ***docker compose up*** command builds (if necessary) and starts all the services defined in your compose.yaml file. It automatically creates the required networks and volumes (only when they are referenced by a service in compose.yaml file), allowing the containers to communicate with each other. By default, it runs in the foreground, showing the logs from all services, but you can run it in detached mode with the **-d** flag. This command is the primary way to start a multi-container application in a single step.

### Rebuilds images first, then starts containers, ensuring changes are:
```
docker compose up --build -d
```
The ***docker compose up --build*** command is an extension of the standard docker compose up that forces Docker to rebuild the images before starting the containers. Normally, docker compose up will use existing images if they already exist, which can lead to running outdated code or dependencies. Adding **--build** ensures that Docker checks the Dockerfile and rebuilds the images for all services that have a build context, so any changes in your source code, dependencies, or Dockerfile are included in the new container. After rebuilding, Compose starts the containers, creates networks and volumes as needed, and runs the application just like a regular up command.

### Hot-reload for development:
```
develop:
    watch:
    - action: sync
        path: ../express_api/src
        target: /app/src
```

Development Mode:
```
docker compose -f compose.dev.yaml up --build --watch
```
The ***docker compose up --watch*** command starts your Docker Compose services and continuously monitors your project files for changes, automatically triggering rebuilds and restarts as needed. If you modify source code that is bind-mounted into a container, Docker will restart just that container; if you change files that affect the build context or Dockerfile, Docker will rebuild the image and then restart the service. This creates a smooth, hot-reload–like development workflow where containers automatically pick up code changes without manually running docker compose build or restarting services.

Rebuild and start:
```
docker compose up --build --watch
```

### List all compose containers:
```
docker compose ps
```
The ***docker compose ps*** command lists all containers associated with the current Compose project. It shows important information such as container names, service names, current status, and exposed ports. This is useful for quickly checking which services are running, monitoring their state, and verifying that the containers started correctly.

### Stop all containers:
```
docker compose stop
```
The ***docker compose stop*** command gracefully stops all running containers defined in your docker-compose.yml file without removing them. It sends a SIGTERM signal to each container, giving the processes inside a chance to shut down cleanly, and after a timeout, it sends SIGKILL if needed. The containers, networks, and volumes remain on your system, so you can restart everything quickly using docker compose start or docker compose up without rebuilding or recreating resources.

### Stop and remove all containers:
```
docker compose down
```
The ***docker compose down*** command stops and removes all containers, networks, and optionally volumes created by ***docker compose up***. It effectively cleans up the environment, allowing you to start fresh next time. By default, it preserves volumes, but you can remove them with the **-v** flag. This command ensures that no lingering resources consume system memory or disk space after your application is stopped.

### Stop specific container:
```
docker compose stop backend
```
The ***docker compose stop backend*** stops only the container named backend as defined in your docker-compose.yml file, instead of stopping the entire application stack. It sends a graceful shutdown signal (SIGTERM) to that specific service, allowing it to clean up and exit safely. The container is *stopped but not removed*, so you can restart it later with ***docker compose start backend*** or ***docker compose up backend*** without rebuilding or recreating anything.

### Show live resource usage:
```
docker compose stats
```
***docker compose stats*** is a convenience command that shows live resource usage (CPU, memory, network I/O, block I/O, PIDs) for all services defined in your docker-compose.yml, similar to what ***docker stats*** does for individual containers. Instead of manually checking each container, this command streams real-time performance metrics for every service in the Compose project, helping you monitor how your application behaves under load. It’s especially useful during development or debugging to quickly detect memory leaks, high CPU usage, or unexpected network traffic across the entire multi-container stack.
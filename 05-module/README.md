#

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
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
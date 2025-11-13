source .env.db
source .env.network

BACKEND_IMAGE_NAME='express_backend_image'
BACKEND_IMAGE_TAG='dev'
BACKEND_CONTAINER_NAME='express_backend'

# Connectivity
LOCALHOST_PORT=3000
CONTAINER_PORT=3000

MONGODB_HOST='mongodb'

if [ "$(docker ps -aq -f name=$BACKEND_CONTAINER_NAME)" ]; then
    echo "A container with the name $BACKEND_CONTAINER_NAME already exists."
    echo "The container will be removed when stopped."
    echo "To stop the container, run: docker stop $BACKEND_CONTAINER_NAME"
    exit 1
fi

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

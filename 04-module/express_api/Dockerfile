FROM node:24.10.0-slim

WORKDIR /app

## Copy only dependency manifests first Copy package.json and package-lock.json
COPY package*.json .

#Install the dependencies (npm install is cached unless dependencies change)
RUN npm ci

#Copy the source code of application (COPY src/index.js index.js or COPY src src)
COPY . .

#Define ENV variables
ENV APP_NAME="Express APP"
ENV PORT=3000

#Expose the application port
EXPOSE ${PORT}

#Start application
CMD [ "node", "src/index.js"]
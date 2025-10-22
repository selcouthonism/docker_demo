FROM node:24.10.0

WORKDIR /app

#Copy package.json and package-lock.json
COPY package*.json .

#Install the dependencies
RUN npm ci

#Copy the source code of application
COPY src/index.js index.js

#Expose the application port
EXPOSE 3000

#Start application
CMD [ "node", "index.js" ]
# express_api

## Create an express project
Before installing, download and install Node.js.

**npm init <initializer>** can be used to set up a new or existing npm package.

If the initializer is omitted (by just calling ***npm init***), init will fall back to legacy init behavior. It will ask you a bunch of questions, and then write a package.json for you. It will attempt to make reasonable guesses based on existing fields, dependencies, and options selected. It is strictly additive, so it will keep any fields and values that were already set. You can also use **-y**/**--yes** to skip the questionnaire altogether. If you pass **--scope**, it will create a scoped package.

Create a package.json:
```
npm init -y
```

Install packages/dependencies:
```
npm install express@5.1.0 body-parser@2.2.0 --save-exact
```

Add start script (**"start": "node src/index.js"**) into package.json to start the Node.js application using npm and start app with:
```
npm start
```

Test it:
```
curl http://localhost:3000
```

### nodemon
**nodemon** is a development tool for Node.js that automatically restarts your app whenever you change your source code — no need to manually stop and restart the server every time. Instead of doing Ctrl + C and then npm start again after each file change, nodemon watches your project files and restarts the app automatically. It saves you time while coding.

Install nodemon (development only) to auto-reload on changes:
```
npm install --save-dev nodemon
```
- **--save-dev** → Save it to devDependencies (which means: only needed during development, not in production). Nodemon will be available during development. It won’t be installed in production builds, which is good practice.

Add start script for dev **dev": "nodemon src/index.js** into package.json and Start app with:
```
npm run dev
```

### Create Dockerfile (first draft):
```
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
```

Build docker image:
```
docker build -t express_api_image:0.0.1 .
```

Run docker image:
```
docker run -d -p 3000:3000 --name express_api express_api_image:0.0.1
```




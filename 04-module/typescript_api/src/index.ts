import express from "express";

const app = express();
const appName = process.env.APP_NAME || "typescript_api";
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  const timestamp = new Date().toISOString(); // e.g. 2025-10-21T14:30:00.123Z
  res.send(`Hello world from express_api. The app name is: ${appName}. Current time is: ${timestamp}`)
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
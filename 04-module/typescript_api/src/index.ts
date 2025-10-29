import express from "express";
import cors from "cors";

const app = express();
const appName = process.env.APP_NAME || "typescript_api";
const port = process.env.PORT || 3000;
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || "http://localhost:5173";
const allowedOrigins = allowedOriginsEnv.split(",");

/*
// Enable CORS for all routes
//app.use(cors());

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173"
];
*/

// Configure CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);  // allow
    } else {
      callback(new Error("Not allowed by CORS"));  // block
    }
  },
  optionsSuccessStatus: 200
}));

app.get('/', (req, res) => {
  const timestamp = new Date().toISOString(); // e.g. 2025-10-21T14:30:00.123Z
  res.send(`Hello world from typescript_api. The app name is: ${appName}. Current time is: ${timestamp}`)
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
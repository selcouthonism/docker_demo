import express from 'express';
import { connectDB } from './infrastructure/database/mongoose.js';
import noteRoutes from "./infrastructure/web/routes/note-routes.js";
import { errorHandler } from './infrastructure/web/middleware/error-handler.js';


export async function createApp() {
    // --- Configuration Loading (Node 24 Native) ---
    try {
        process.loadEnvFile(); // Defaults to reading .env
    } catch (err) {
    // It's acceptable to fail silently if .env is missing in production 
    // (assuming env vars are injected by the host OS/Container)
    console.log('No .env file found, relying on system environment variables.');
    }

    const MONGO_URI = process.env.DB_URL;

    if (!MONGO_URI) {
        console.error('FATAL: MONGO_URI is not defined in environment.');
        process.exit(1);
    }

    // --- App Setup ---
    const app = express();
    app.use(express.json());

    // Routes
    app.use(noteRoutes);

    // --- Global Error Handler (MUST BE LAST) ---
    app.use(errorHandler);

    // Instantiate Infrastructure
    await connectDB(MONGO_URI); 

  return app;
}

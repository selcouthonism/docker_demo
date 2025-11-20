import express from "express";
import notebookRoutes from "./interfaces/http/routes/notebookRoutes.js";
import healthRoute from "./interfaces/health/healthRoute.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();
  app.use(express.json());

  // Routes
  app.use(notebookRoutes);
  app.use(healthRoute);

  // Error handler (as last middleware)
  app.use(errorHandler);

  return app;
}

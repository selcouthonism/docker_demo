import { Router } from "express";
import { NotebookController } from "../controllers/NotebookController.js";
import { NotebookService } from "../../../application/notebook/NotebookService.js";
import { InMemoryNotebookRepository } from "../../../infrastructure/persistence/InMemoryNotebookRepository.js";
import { MongooseNotebookRepository } from "../../../infrastructure/persistence/MongooseNotebookRepository.js";

const router = Router();

// Setup service + controller
// const repo = new InMemoryNotebookRepository();
const repo = new MongooseNotebookRepository();
const service = new NotebookService(repo);
const controller = new NotebookController(service);

// Define routes
router.post("/api/notebooks", controller.create);
router.get("/api/notebooks", controller.list);
router.get("/api/notebooks/:id", controller.get);
router.put("/api/notebooks/:id", controller.update);
router.delete("/api/notebooks/:id", controller.delete);

export default router;

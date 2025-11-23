import { Router } from "express";
import { MongoNoteRepository } from '../../database/note-repository.js';
import { HttpNotebookService } from '../../services/notebook-service.js';
import { CreateNoteUseCase } from '../../../application/create-note.js';
import { NoteController } from '../controllers/note-controller.js';

const router = Router();

// Setup service + controller
const noteRepo = new MongoNoteRepository();
const notebookService = new HttpNotebookService();

// Instantiate Use Cases
const createNoteUseCase = new CreateNoteUseCase(noteRepo, notebookService);

// Instantiate Controllers
const noteController = new NoteController(createNoteUseCase);

// --- Routes ---
router.post('/api/notes', noteController.create);
router.get('/api/notes/:id', noteController.find);

export default router;
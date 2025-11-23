import { ValidationError, NotFoundError, ServiceUnavailableError } from '../domain/errors.js';

export class CreateNoteUseCase {
  constructor(noteRepository, notebookService) {
    this.noteRepository = noteRepository;
    this.notebookService = notebookService;
  }

  async execute({ title, content, notebookId }) {
    // 1. Basic Validation
    if (!title || !content) {
      throw new ValidationError('Title and content are required');
    }

    // 2. Notebook ID Logic
    if (notebookId) {
      try {
        const exists = await this.notebookService.checkExists(notebookId);
        
        if (!exists) {
          // Requirement: If notebookId does not exist, returns 404.
          throw new NotFoundError(`Notebook with id ${notebookId} not found`);
        }
      } catch (error) {
        // Requirement: If notebooks service is down, stores note with provided notebookId
        if (error instanceof ServiceUnavailableError) {
          console.warn("Service down detected. Proceeding to save note via Fallback logic.");
          // We swallow the error and proceed to save
        } else if (error instanceof NotFoundError) {
            // We re-throw the 404 because that is a hard stop
            throw error;
        } else {
           // Unforeseen error -> treat as service down/fallback
           console.warn("Unexpected error in notebook check. Proceeding.");
        }
      }
    }

    // 3. Save Note
    const newNote = await this.noteRepository.save({
      title,
      content,
      notebookId
    });

    return newNote;
  }

  async find(id) {
    const note = await this.noteRepository.findById(id);
    
    if(!note){
      throw new NotFoundError("Note not found.");
    }
    
    return note;
  }

}
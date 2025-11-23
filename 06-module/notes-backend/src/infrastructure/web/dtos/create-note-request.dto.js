import { ValidationError } from '../../../domain/errors.js';

export class CreateNoteRequestDTO {
  constructor(body) {
    this.title = body.title;
    this.content = body.content;
    this.notebookId = body.notebookId;
  }

  /**
   * Validates the DTO.
   * Throws ValidationError if the contract is violated.
   */
  validate() {

    // Rule: Title is required
    if (!this.title || typeof this.title !== 'string' || this.title.trim() === '') {
      throw new ValidationError('Title is required and must be a non-empty string.');
    }

    // Rule: Content is required
    if (!this.content || typeof this.content !== 'string') {
      throw new ValidationError('Content is required and must be a string.');
    }

    // Rule: NotebookId is optional, but if present, must be a string
    if (this.notebookId !== undefined && typeof this.notebookId !== 'string') {
      throw new ValidationError('Notebook ID must be a string.');
    }
  }

  /**
   * Returns the sanitized data object for the Use Case.
   */
  toUseCaseInput() {
    return {
      title: this.title.trim(),
      content: this.content,
      notebookId: this.notebookId
    };
  }
}
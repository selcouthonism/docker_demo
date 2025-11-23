export class NoteResponseDTO {
  constructor(noteEntity) {
    // Map Mongo's _id to a cleaner 'id'
    this.id = noteEntity._id ? noteEntity._id.toString() : noteEntity.id;
    this.title = noteEntity.title;
    this.content = noteEntity.content;
    this.notebookId = noteEntity.notebookId || null;
    this.createdAt = noteEntity.createdAt;
    
    // We specifically exclude __v or other internal DB flags here
  }

  static from(noteEntity) {
    return new NoteResponseDTO(noteEntity);
  }
}
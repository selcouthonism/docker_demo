import mongoose from 'mongoose';

// 1. The Mongoose Schema (Framework detail)
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  notebookId: { type: String, required: false },
}, { timestamps: true });

const NoteModel = mongoose.model('Note', noteSchema);

// 2. The Repository Implementation
export class MongoNoteRepository {
  async save(noteData) {
    const note = new NoteModel(noteData);
    const saved = await note.save();
    
    // Return a plain object (detach from Mongoose)
    return saved.toObject();
  }

  async findById(id) {
    return await NoteModel.findById(id);
  }
}
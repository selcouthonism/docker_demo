import type { INotebookRepository } from "../../domain/notebook/INotebookRepository.js";
import type { Notebook } from "../../domain/notebook/Notebook.js";
import { model, Schema, Document } from "mongoose";

interface NotebookDoc extends Document {
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notebookSchema = new Schema<NotebookDoc>(
  {
    name: { type: String, required: true },
    description: { type: String, required: false, default: null },
  },
  { timestamps: true }
);

const NotebookModel = model<NotebookDoc>("Notebook", notebookSchema);

export class MongooseNotebookRepository implements INotebookRepository {
  async create(data: { name: string; description?: string }): Promise<Notebook> {
    const doc = new NotebookModel({
      name: data.name,
      description: data.description,
    });
    const saved = await doc.save();
    return this.toDomain(saved);
  }

  async findAll(): Promise<Notebook[]> {
    const docs = await NotebookModel.find().exec();
    return docs.map(d => this.toDomain(d));
  }

  async findById(id: string): Promise<Notebook | null> {
    const doc = await NotebookModel.findById(id).exec();
    if (!doc) return null;
    return this.toDomain(doc);
  }

  async update(id: string, data: { name?: string; description?: string }): Promise<Notebook | null> {
    const doc = await NotebookModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await NotebookModel.findByIdAndDelete(id).exec();
    return res != null;
  }

  private toDomain(doc: NotebookDoc): Notebook {
    return {
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}

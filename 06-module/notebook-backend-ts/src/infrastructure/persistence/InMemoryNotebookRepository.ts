import { type INotebookRepository } from "../../domain/notebook/INotebookRepository.js";
import { type Notebook } from "../../domain/notebook/Notebook.js";
import { v4 as uuidv4 } from "uuid";

export class InMemoryNotebookRepository implements INotebookRepository {
  private items: Notebook[] = [];

  async create(data: Omit<Notebook, "id" | "createdAt" | "updatedAt">): Promise<Notebook> {
    const now = new Date();
    const nb: Notebook = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      createdAt: now,
      updatedAt: now,
    };
    this.items.push(nb);
    return nb;
  }

  async findAll(): Promise<Notebook[]> {
    return this.items;
  }

  async findById(id: string): Promise<Notebook | null> {
    const nb = this.items.find(i => i.id === id) ?? null;
    return nb;
  }

  async update(id: string, data: Partial<Omit<Notebook, "id" | "createdAt">>): Promise<Notebook | null> {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return null;

    const existing = this.items[idx];
    if (!existing) return null;
    
    const updated: Notebook = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date(),
    };
    this.items[idx] = updated;
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }
}

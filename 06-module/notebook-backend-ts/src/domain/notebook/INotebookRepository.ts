import type { Notebook } from "./Notebook.js";

export interface INotebookRepository {
  create(notebook: Omit<Notebook, "id" | "createdAt" | "updatedAt">): Promise<Notebook>;
  findAll(): Promise<Notebook[]>;
  findById(id: string): Promise<Notebook | null>;
  update(id: string, notebook: Partial<Omit<Notebook, "id" | "createdAt">>): Promise<Notebook | null>;
  delete(id: string): Promise<boolean>;
}

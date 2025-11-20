import type { INotebookRepository } from "../../domain/notebook/INotebookRepository.js";
import type { Notebook } from "../../domain/notebook/Notebook.js";
import type { CreateNotebookDTO, UpdateNotebookDTO } from "./dto.js";

export class NotebookService {
  constructor(private repository: INotebookRepository) {}

  async create(dto: CreateNotebookDTO): Promise<Notebook> {
    if (!dto.name) {
      throw new Error("Name is required");
    }

    const notebook = await this.repository.create({
      name: dto.name,
      description: dto.description,
    });

    return notebook;
  }

  async list(): Promise<Notebook[]> {
    return this.repository.findAll();
  }

  async get(id: string): Promise<Notebook> {
    const nb = await this.repository.findById(id);
    if (!nb) {
      throw new Error("Not found");
    }
    return nb;
  }

  async update(id: string, dto: UpdateNotebookDTO): Promise<Notebook> {
    const updated = await this.repository.update(id, dto);
    if (!updated) {
      throw new Error("Not found");
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error("Not found");
    }
  }
}

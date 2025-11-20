import type { Request, Response } from "express";
import { NotebookService } from "../../../application/notebook/NotebookService.js";
import type { CreateNotebookDTO, UpdateNotebookDTO } from "../../../application/notebook/dto.js";

export class NotebookController {
  constructor(private service: NotebookService) {}

  create = async (req: Request, res: Response) => {
    try {
      const body = req.body as CreateNotebookDTO;
      if (!body.name) {
        return res.status(400).json({ message: "Name is required" });
      }
      const notebook = await this.service.create(body);
      return res.status(201).json(notebook);
    } catch (err: any) {
      console.error("create error", err);
      return res.status(500).json({ message: err.message });
    }
  };

  list = async (req: Request, res: Response) => {
    const notebooks = await this.service.list();
    return res.json(notebooks);
  };

  get = async (req: Request, res: Response) => {
    try {
      const id = req.params.id!;
      const notebook = await this.service.get(id);
      return res.json(notebook);
    } catch (err: any) {
      return res.status(404).json({ message: "Notebook not found" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id!;
      const body = req.body as UpdateNotebookDTO;
      const updated = await this.service.update(id, body);
      return res.status(200).json(updated);
    } catch (err: any) {
      return res.status(404).json({ message: "Notebook not found" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const id = req.params.id!;
      await this.service.delete(id);
      return res.status(204).send();
    } catch (err: any) {
      return res.status(404).json({ message: "Notebook not found" });
    }
  };
}

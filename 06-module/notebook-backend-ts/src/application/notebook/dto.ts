export interface CreateNotebookDTO {
  name: string;
  description?: string;
}

export interface UpdateNotebookDTO {
  name?: string;
  description?: string;
}

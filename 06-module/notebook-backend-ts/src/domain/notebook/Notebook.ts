export interface Notebook {
  id: string;
  name: string;
  description?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
}

import { Router, type Request, type Response } from "express";
const router = Router();

router.get("/health", (req: Request, res: Response) => {
  res.status(200).send("up");
});

export default router;

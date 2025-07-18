import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Welcome to LinkLite API👋" });
});

export { app };

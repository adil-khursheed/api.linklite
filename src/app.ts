import express, { Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Welcome to LinkLite API👋" });
});

app.use(globalErrorHandler);
export { app };

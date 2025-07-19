import express, { Request, Response } from "express";
import globalErrorHandler from "./middlewares/globalErrorHandler";

import userRoutes from "./user/userRoutes.js";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.json({ message: "Welcome to LinkLite API👋" });
});

// Routes
app.use("/api/v1/users", userRoutes);

app.use(globalErrorHandler);
export { app };

import express from "express";
import { createUrl } from "./urlController";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.post("/create", checkAuth, createUrl);

export default router;

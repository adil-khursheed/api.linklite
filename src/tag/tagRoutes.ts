import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { createTag, getTags } from "./tagController";

const router = express.Router();

router.use(checkAuth);

router.get("/get/:workspace_slug", getTags);
router.post("/create", createTag);

export default router;

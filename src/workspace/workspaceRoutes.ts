import express from "express";
import { checkWorkspaceSlugs, createWorkspace } from "./workspaceController";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.use(checkAuth);

router.post("/check-slug", checkWorkspaceSlugs);
router.post("/create", createWorkspace);

export default router;

import express from "express";
import {
  checkWorkspaceSlugs,
  countWorkspace,
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceBySlug,
} from "./workspaceController";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.use(checkAuth);

router.post("/count", countWorkspace);
router.post("/check-slug", checkWorkspaceSlugs);
router.post("/create", createWorkspace);
router.get("/get/:workspace_slug", getWorkspaceBySlug);
router.get("/get", getAllWorkspaces);

export default router;

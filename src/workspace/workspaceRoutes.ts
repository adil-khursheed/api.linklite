import express from "express";
import {
  checkWorkspaceSlugs,
  countWorkspace,
  createWorkspace,
  deleteWorkspace,
  getAllWorkspaces,
  getWorkspaceBySlug,
  updateWorkspace,
} from "./workspaceController";
import { checkAuth } from "../middlewares/checkAuth";
import { requirePermission } from "../middlewares/checkPermission";

const router = express.Router();

router.use(checkAuth);

router.post("/count", countWorkspace);
router.post("/check-slug", checkWorkspaceSlugs);
router.post("/create", createWorkspace);
router.get("/get/:workspace_slug", getWorkspaceBySlug);
router.get("/get", getAllWorkspaces);
router.patch(
  "/update/:workspace_slug",
  requirePermission("ws:update"),
  updateWorkspace
);
router.delete(
  "/delete/:workspace_slug",
  requirePermission("ws:delete"),
  deleteWorkspace
);

export default router;

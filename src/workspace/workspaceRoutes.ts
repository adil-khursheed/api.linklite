import express from "express";
import {
  checkWorkspaceSlugs,
  countWorkspace,
  createWorkspace,
  getAllWorkspaces,
  getWorkspaceBySlug,
  inviteTeamMembers,
} from "./workspaceController";
import { checkAuth } from "../middlewares/checkAuth";
import { validateRequest } from "../middlewares/validationMiddleware";
import { inviteMemberSchema } from "../schemas/workspaceSchemas";

const router = express.Router();

router.use(checkAuth);

router.post("/count", countWorkspace);
router.post("/check-slug", checkWorkspaceSlugs);
router.post("/create", createWorkspace);
router.get("/get/:workspace_slug", getWorkspaceBySlug);
router.get("/get", getAllWorkspaces);
router.post(
  "/invite/:workspace_slug",
  validateRequest(inviteMemberSchema),
  inviteTeamMembers
);

export default router;

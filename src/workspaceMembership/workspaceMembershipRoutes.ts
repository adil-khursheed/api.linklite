import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { getWorkspaceMembers } from "./workspaceMembershipController";
import { requirePermission } from "../middlewares/checkPermission";

const router = express.Router();

router.use(checkAuth);

router.get(
  "/:workspace_slug/members",
  requirePermission("ws:members:view"),
  getWorkspaceMembers
);

export default router;

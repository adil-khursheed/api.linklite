import express from "express";
import { validateRequest } from "../middlewares/validationMiddleware";
import { requirePermission } from "../middlewares/checkPermission";
import { checkAuth } from "../middlewares/checkAuth";
import { inviteMemberSchema } from "../schemas/inviteMemberSchema";
import { inviteTeamMembers } from "./invitationController";

const router = express.Router();

router.use(checkAuth);

router.post(
  "/invite/:workspace_slug",
  requirePermission("ws:members:invite"),
  validateRequest(inviteMemberSchema),
  inviteTeamMembers
);

export default router;

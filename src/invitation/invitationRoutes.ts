import express from "express";
import { validateRequest } from "../middlewares/validationMiddleware";
import { inviteMemberSchema } from "../schemas/workspaceMembershipSchemas";
import { inviteTeamMembers } from "./invitationController";

const router = express.Router();

router.post(
  "/invite/:workspace_slug",
  validateRequest(inviteMemberSchema),
  inviteTeamMembers
);

export default router;

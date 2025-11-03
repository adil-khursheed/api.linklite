import express from "express";
import { validateRequest } from "../middlewares/validationMiddleware";
import { inviteTeamMembers } from "./workspaceMembershipController";
import { inviteMemberSchema } from "../schemas/workspaceMembershipSchemas";

const router = express.Router();

router.post(
  "/invite/:workspace_slug",
  validateRequest(inviteMemberSchema),
  inviteTeamMembers
);

export default router;

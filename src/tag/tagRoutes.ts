import express from "express";
import { checkAuth } from "../middlewares/checkAuth";
import { createTag, getTags } from "./tagController";
import { requirePermission } from "../middlewares/checkPermission";

const router = express.Router();

router.use(checkAuth);

router.get("/get/:workspace_slug", requirePermission("ws:tags:view"), getTags);
router.post(
  "/create/:workspace_slug",
  requirePermission("ws:tags:create"),
  createTag
);

export default router;

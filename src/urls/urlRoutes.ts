import express from "express";
import { createUrl, getUrls, scrapeMetadata } from "./urlController";
import { checkAuth } from "../middlewares/checkAuth";
import { requirePermission } from "../middlewares/checkPermission";

const router = express.Router();

router.use(checkAuth);

router.post("/metadata/scrape", scrapeMetadata);
router.get("/get/:workspace_slug", requirePermission("ws:links:view"), getUrls);
router.post(
  "/create/:workspace_slug",
  requirePermission("ws:links:create"),
  createUrl
);

export default router;

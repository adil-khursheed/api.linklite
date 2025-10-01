import express from "express";
import { createUrl, getUrls, scrapeMetadata } from "./urlController";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.use(checkAuth);

router.post("/metadata/scrape", scrapeMetadata);
router.get("/get/:workspace_slug", getUrls);
router.post("/create", createUrl);

export default router;

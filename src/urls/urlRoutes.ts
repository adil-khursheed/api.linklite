import express from "express";
import { createUrl, scrapeMetadata } from "./urlController";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.use(checkAuth);

router.post("/create", createUrl);
router.post("/metadata/scrape", scrapeMetadata);

export default router;

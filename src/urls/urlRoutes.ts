import express from "express";
import { createUrl, redirectToOriginalLink } from "./urlController";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.post("/create", checkAuth, createUrl);
router.get("/:shortLinkId", redirectToOriginalLink);

export default router;

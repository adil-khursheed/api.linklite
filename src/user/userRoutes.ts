import express from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmail,
  verifyEmail,
} from "./userController";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.post("/register", registerUser);
router.post("/verify-email", checkAuth, verifyEmail);
router.post("/resend-email", checkAuth, resendEmail);
router.post("/login", loginUser);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/logout", checkAuth, logoutUser);

export default router;

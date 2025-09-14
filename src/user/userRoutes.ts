import express from "express";
import {
  changePassword,
  forgotPassword,
  getUser,
  googleAuth,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmail,
  resetPassword,
  verifyEmail,
} from "./userController";
import { checkAuth } from "../middlewares/checkAuth";

const router = express.Router();

router.post("/google-auth", googleAuth);
router.post("/register", registerUser);
router.post("/verify-email", checkAuth, verifyEmail);
router.post("/resend-email", checkAuth, resendEmail);
router.post("/login", loginUser);
router.post("/refresh-access-token", refreshAccessToken);
router.post("/logout", checkAuth, logoutUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", checkAuth, changePassword);
router.get("/profile", checkAuth, getUser);

export default router;

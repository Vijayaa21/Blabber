import express from "express";
import {
  signup,
  login,
  logout,
  getMe,
  sendVerifyOtp,
  verifyOtp,
  sendResetOtp,
  resetPassword,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();


router.get("/me", protectRoute, getMe);
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);


router.post("/send-verify-otp", protectRoute, sendVerifyOtp); // send OTP after signup
router.post("/verify-otp", protectRoute, verifyOtp);          // verify account using OTP

router.post("/send-reset-otp", sendResetOtp);                 // send OTP to email for password reset
router.post("/reset-password", resetPassword);                // reset password using OTP

export default router;

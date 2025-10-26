import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  verifyOTP,
  resendOTP,
  requestPasswordReset,
  verifyResetOTP,
  resetPassword,
  getMe,
  updateName,
} from "../controllers/userController.js";
import authenticateToken from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/verify-otp", verifyOTP);
userRouter.post("/resend-otp", resendOTP);
userRouter.post("/password/request-reset", requestPasswordReset);
userRouter.post("/password/verify-otp", verifyResetOTP);
userRouter.post("/password/reset", resetPassword);

userRouter.get("/me", authenticateToken, getMe);
userRouter.patch("/me", authenticateToken, updateName);

export default userRouter;

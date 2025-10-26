import express from "express";
import authenticateToken from "../middleware/auth.js";
import {
  getMyCoupons,
  redeemCouponByPoints,
  validateCoupon,
  createCouponTemplate,
  listCouponTemplates,
  redeemCouponFromTemplate,
} from "../controllers/couponController.js";

const couponRouter = express.Router();

couponRouter.get("/", authenticateToken, getMyCoupons);
couponRouter.post("/redeem", authenticateToken, redeemCouponByPoints);
couponRouter.post("/validate", authenticateToken, validateCoupon);

// Template-based testing endpoints
couponRouter.post("/templates", createCouponTemplate);
couponRouter.get("/templates", listCouponTemplates);
couponRouter.post(
  "/redeem-template",
  authenticateToken,
  redeemCouponFromTemplate
);

export default couponRouter;

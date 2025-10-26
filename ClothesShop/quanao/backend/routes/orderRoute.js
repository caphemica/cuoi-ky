import express from "express";
import authenticateToken from "../middleware/auth.js";
import requireAdmin from "../middleware/admin.js";
import {
  createOrder,
  getMyOrders,
  requestCancelOrder,
  updateOrderStatus,
  adminListOrders,
  adminOrderStats,
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.get("/", authenticateToken, getMyOrders);
orderRouter.post("/", authenticateToken, createOrder);
orderRouter.patch("/:id/status", updateOrderStatus);
orderRouter.get("/admin", authenticateToken, requireAdmin, adminListOrders);
orderRouter.get(
  "/admin/stats",
  authenticateToken,
  requireAdmin,
  adminOrderStats
);

export default orderRouter;

// Yêu cầu hủy
orderRouter.patch("/:id/cancel-request", authenticateToken, requestCancelOrder);

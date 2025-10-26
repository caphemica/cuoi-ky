import express from "express";
import {
  getAllProduct,
  getHomepageData,
  getProductById,
  createProduct,
} from "../controllers/productController.js";
import authenticateToken from "../middleware/auth.js";
import requireAdmin from "../middleware/admin.js";

const productRouter = express.Router();
productRouter.get("/", getAllProduct);
productRouter.get("/homepage", getHomepageData);
productRouter.get("/:id", getProductById);
productRouter.post("/", authenticateToken, requireAdmin, createProduct);

export default productRouter;

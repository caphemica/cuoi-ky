import express from "express";
import authenticateToken from "../middleware/auth.js";
import {
  addToCart,
  getMyCart,
  decreaseFromCart,
  removeFromCart,
} from "../controllers/cartController.js";

const cartRouter = express.Router();

cartRouter.get("/", authenticateToken, getMyCart);
cartRouter.post("/add", authenticateToken, addToCart);
cartRouter.patch("/decrease", authenticateToken, decreaseFromCart);
cartRouter.delete("/remove", authenticateToken, removeFromCart);

export default cartRouter;

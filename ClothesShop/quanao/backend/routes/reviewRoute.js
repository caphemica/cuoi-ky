import express from "express";
import authenticateToken from "../middleware/auth.js";
import {
  getProductReviews,
  createReview,
  getMyReviews,
  getEligibleOrdersForReview,
} from "../controllers/reviewController.js";

const reviewRouter = express.Router();

// Public routes
reviewRouter.get("/product/:productId", getProductReviews);

// Protected routes
reviewRouter.use(authenticateToken);
reviewRouter.post("/", createReview);
reviewRouter.get("/my-reviews", getMyReviews);
reviewRouter.get("/eligible-orders/:productId", getEligibleOrdersForReview);

export default reviewRouter;

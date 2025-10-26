import express from "express";
import authenticateToken from "../middleware/auth.js";
import { getMyPromotionScore } from "../controllers/promotionScoreController.js";

const promotionScoreRouter = express.Router();

promotionScoreRouter.get("/", authenticateToken, getMyPromotionScore);

export default promotionScoreRouter;

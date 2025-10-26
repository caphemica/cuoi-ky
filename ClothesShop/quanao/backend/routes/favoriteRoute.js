import express from "express";
import authenticateToken from "../middleware/auth.js";
import {
  addToFavorites,
  removeFromFavorites,
  getMyFavorites,
  checkFavorite,
} from "../controllers/favoriteController.js";

const favoriteRouter = express.Router();

// All routes require authentication
favoriteRouter.use(authenticateToken);

favoriteRouter.post("/", addToFavorites);
favoriteRouter.delete("/:productId", removeFromFavorites);
favoriteRouter.get("/", getMyFavorites);
favoriteRouter.get("/check/:productId", checkFavorite);

export default favoriteRouter;

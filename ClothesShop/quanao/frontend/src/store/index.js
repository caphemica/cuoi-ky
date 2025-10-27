import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import cartReducer from "./slices/cartSlice";
import promotionScoreReducer from "./slices/promotionScoreSlice";
import reviewReducer from "./slices/reviewSlice";
import favoriteReducer from "./slices/favoriteSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    promotionScore: promotionScoreReducer,
    review: reviewReducer,
    favorite: favoriteReducer,
  },
});

export default store;

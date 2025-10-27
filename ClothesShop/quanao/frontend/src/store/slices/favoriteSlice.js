import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  addToFavoritesApi,
  removeFromFavoritesApi,
  getMyFavoritesApi,
  checkFavoriteApi,
} from "../../services/api";

// Add to favorites
export const addToFavorites = createAsyncThunk(
  "favorite/addToFavorites",
  async (productId, thunkAPI) => {
    try {
      const res = await addToFavoritesApi(productId);
      if (res.success) return res.data;
      return thunkAPI.rejectWithValue(
        res.message || "Failed to add to favorites"
      );
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

// Remove from favorites
export const removeFromFavorites = createAsyncThunk(
  "favorite/removeFromFavorites",
  async (productId, thunkAPI) => {
    try {
      const res = await removeFromFavoritesApi(productId);
      if (res.success) return productId; // Return productId to remove from state
      return thunkAPI.rejectWithValue(
        res.message || "Failed to remove from favorites"
      );
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

// Fetch my favorites
export const fetchMyFavorites = createAsyncThunk(
  "favorite/fetchMyFavorites",
  async (query = {}, thunkAPI) => {
    try {
      const res = await getMyFavoritesApi(query);
      if (res.success) return res.data;
      return thunkAPI.rejectWithValue(
        res.message || "Failed to fetch favorites"
      );
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

// Check if product is favorite
export const checkFavorite = createAsyncThunk(
  "favorite/checkFavorite",
  async (productId, thunkAPI) => {
    try {
      const res = await checkFavoriteApi(productId);
      if (res.success) return { productId, isFavorite: res.data.isFavorite };
      return thunkAPI.rejectWithValue(
        res.message || "Failed to check favorite"
      );
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

const initialState = {
  favorites: {
    favorites: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 12,
    },
  },
  favoriteStatus: {}, // Track favorite status for each product
  loading: false,
  error: null,
};

const favoriteSlice = createSlice({
  name: "favorite",
  initialState,
  reducers: {
    resetFavorites(state) {
      state.favorites = initialState.favorites;
      state.favoriteStatus = {};
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    setFavoriteStatus(state, action) {
      const { productId, isFavorite } = action.payload;
      state.favoriteStatus[productId] = isFavorite;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to favorites
      .addCase(addToFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favoriteStatus[action.payload.favoriteProductId] = true;
      })
      .addCase(addToFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add to favorites";
      })
      // Remove from favorites
      .addCase(removeFromFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromFavorites.fulfilled, (state, action) => {
        state.loading = false;
        const productId = action.payload;
        state.favoriteStatus[productId] = false;
        // Remove from favorites list if it exists
        state.favorites.favorites = state.favorites.favorites.filter(
          (item) => item.favoriteProductId !== productId
        );
        state.favorites.pagination.totalItems = Math.max(
          0,
          state.favorites.pagination.totalItems - 1
        );
      })
      .addCase(removeFromFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to remove from favorites";
      })
      // Fetch my favorites
      .addCase(fetchMyFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyFavorites.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
        // Update favorite status for all items
        if (action.payload && action.payload.favorites) {
          action.payload.favorites.forEach((item) => {
            state.favoriteStatus[item.favoriteProductId] = true;
          });
        }
      })
      .addCase(fetchMyFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch favorites";
      })
      // Check favorite
      .addCase(checkFavorite.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkFavorite.fulfilled, (state, action) => {
        state.loading = false;
        const { productId, isFavorite } = action.payload;
        state.favoriteStatus[productId] = isFavorite;
      })
      .addCase(checkFavorite.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to check favorite";
      });
  },
});

export const { resetFavorites, clearError, setFavoriteStatus } =
  favoriteSlice.actions;
export default favoriteSlice.reducer;

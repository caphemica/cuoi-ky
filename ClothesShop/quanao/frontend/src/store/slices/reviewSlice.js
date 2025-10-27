import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getProductReviewsApi,
  createReviewApi,
  getMyReviewsApi,
  getEligibleOrdersForReviewApi,
} from "../../services/api";

// Fetch product reviews
export const fetchProductReviews = createAsyncThunk(
  "review/fetchProductReviews",
  async ({ productId, query = {} }, thunkAPI) => {
    try {
      const res = await getProductReviewsApi(productId, query);
      if (res.success) return res.data;
      return thunkAPI.rejectWithValue(res.message || "Failed to fetch reviews");
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

// Create review
export const createReview = createAsyncThunk(
  "review/createReview",
  async (payload, thunkAPI) => {
    try {
      const res = await createReviewApi(payload);
      if (res.success) return res.data;
      return thunkAPI.rejectWithValue(res.message || "Failed to create review");
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

// Fetch my reviews
export const fetchMyReviews = createAsyncThunk(
  "review/fetchMyReviews",
  async (query = {}, thunkAPI) => {
    try {
      const res = await getMyReviewsApi(query);
      if (res.success) return res.data;
      return thunkAPI.rejectWithValue(
        res.message || "Failed to fetch my reviews"
      );
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

// Fetch eligible orders for review
export const fetchEligibleOrdersForReview = createAsyncThunk(
  "review/fetchEligibleOrdersForReview",
  async (productId, thunkAPI) => {
    try {
      const res = await getEligibleOrdersForReviewApi(productId);
      if (res.success) return res.data;
      return thunkAPI.rejectWithValue(
        res.message || "Failed to fetch eligible orders"
      );
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

const initialState = {
  productReviews: {
    reviews: [],
    stats: {
      averageRating: 0,
      totalReviews: 0,
      ratingCounts: [],
    },
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 10,
    },
  },
  myReviews: {
    reviews: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 10,
    },
  },
  eligibleOrders: [],
  loading: false,
  error: null,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    resetReviews(state) {
      state.productReviews = initialState.productReviews;
      state.myReviews = initialState.myReviews;
      state.eligibleOrders = [];
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.productReviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch reviews";
      })
      // Create review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        // Add new review to product reviews
        state.productReviews.reviews.unshift(action.payload);
        state.productReviews.pagination.totalItems += 1;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to create review";
      })
      // Fetch my reviews
      .addCase(fetchMyReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.myReviews = action.payload;
      })
      .addCase(fetchMyReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch my reviews";
      })
      // Fetch eligible orders
      .addCase(fetchEligibleOrdersForReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEligibleOrdersForReview.fulfilled, (state, action) => {
        state.loading = false;
        state.eligibleOrders = action.payload;
      })
      .addCase(fetchEligibleOrdersForReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch eligible orders";
      });
  },
});

export const { resetReviews, clearError } = reviewSlice.actions;
export default reviewSlice.reducer;

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMyPromotionScoreApi } from "@/services/api";

export const fetchMyPromotionScore = createAsyncThunk(
  "promotionScore/fetchMyPromotionScore",
  async (_, thunkAPI) => {
    try {
      const res = await getMyPromotionScoreApi();
      if (res.success) return res.data;
      return thunkAPI.rejectWithValue(
        res.message || "Failed to fetch promotion score"
      );
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

const initialState = {
  totalPromotionScore: 0,
  loading: false,
  error: null,
};

const promotionScoreSlice = createSlice({
  name: "promotionScore",
  initialState,
  reducers: {
    resetPromotionScore(state) {
      state.totalPromotionScore = 0;
      state.error = null;
    },
    setPromotionScore(state, action) {
      state.totalPromotionScore = Number(action.payload || 0);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyPromotionScore.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPromotionScore.fulfilled, (state, action) => {
        state.loading = false;
        state.totalPromotionScore = Number(
          action.payload?.totalPromotionScore || 0
        );
      })
      .addCase(fetchMyPromotionScore.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch promotion score";
      });
  },
});

export const { resetPromotionScore, setPromotionScore } =
  promotionScoreSlice.actions;
export default promotionScoreSlice.reducer;

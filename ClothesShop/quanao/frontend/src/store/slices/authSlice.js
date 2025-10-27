import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMeApi, loginApi, updateNameApi } from "../../services/api";
import { useEffect, useState } from "react";

export const fetchMe = createAsyncThunk("auth/fetchMe", async (_, thunkAPI) => {
  try {
    const res = await getMeApi();
    if (res.success) return res.data;
    return thunkAPI.rejectWithValue(res.message || "Failed to fetch me");
  } catch (e) {
    return thunkAPI.rejectWithValue(e.message);
  }
});

export const updateProfileName = createAsyncThunk(
  "auth/updateProfileName",
  async (name, thunkAPI) => {
    try {
      const res = await updateNameApi(name);
      if (res.success) return res.data;
      return thunkAPI.rejectWithValue(res.message || "Failed to update name");
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

export const doLogin = createAsyncThunk(
  "auth/doLogin",
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await loginApi(email, password);
      if (res.success) {
        localStorage.setItem("access_token", res.token);
        return res.user;
      }
      return thunkAPI.rejectWithValue(res.message || "Login failed");
    } catch (e) {
      return thunkAPI.rejectWithValue(e.message);
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("access_token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload || "Unauthorized";
      })
      .addCase(doLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(doLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(doLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })
      .addCase(updateProfileName.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileName.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfileName.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update name";
      });
  },
});

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;

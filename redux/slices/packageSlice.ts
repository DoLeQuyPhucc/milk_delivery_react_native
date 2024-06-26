import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { callApi } from "@/hooks/useAxios";

export const fetchPackages = createAsyncThunk(
  "packages/fetchPackages",
  async () => {
    try {
      const data = await callApi("GET", "/api/packages/getAllPackages");
      return data;
    } catch (error) {
      throw error;
    }
  }
);

const packageSlice = createSlice({
  name: "packages",
  initialState: {
    packages: [] as any[],
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        console.log("Fetching all packages: pending");
        state.status = "loading";
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        console.log("Fetching all packages: succeeded");
        state.status = "succeeded";
        state.packages = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        console.log("Fetching all packages: failed", action.error.message);
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export default packageSlice.reducer;

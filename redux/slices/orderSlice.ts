// src/store/ordersSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { callApi } from "@/hooks/useAxios";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  productImage: string;
}

interface Package {
  products: { product: Product; quantity: number }[];
  totalPrice: number;
}

interface Order {
  _id: string;
  package: Package;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (userId: string) => {
    const data = await callApi("GET", `/api/orders/user/${userId}`);
    return data as Order[];
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        console.log("Failed to fetch orders", action.error.message);
        state.error = action.error.message ?? "Failed to fetch orders";
      });
  },
});

export default ordersSlice.reducer;

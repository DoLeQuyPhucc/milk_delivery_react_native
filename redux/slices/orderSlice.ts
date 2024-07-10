import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createSelector } from "reselect";
import { RootState } from "@/redux/store/store"; // Ensure this path is correct
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
  status: string;
  deliveredAt: string;
  circleShipment: {
    tracking: { isDelivered: boolean }[];
    numberOfShipment: number;
  };
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

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) => state.orders.error;

export const makeSelectOrdersByStatus = (status: string) =>
  createSelector([selectOrders], (orders) =>
    orders.filter((order) => order.status === status)
  );

export default ordersSlice.reducer;

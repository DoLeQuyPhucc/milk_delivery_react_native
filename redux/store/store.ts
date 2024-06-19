import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../slices/productSlice";
import productDetailReducer from "../slices/productDetailSlice";
import authReducer from "../slices/authSlice";

const store = configureStore({
  reducer: {
    products: productReducer,
    productDetail: productDetailReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

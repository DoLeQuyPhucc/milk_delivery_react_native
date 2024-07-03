import { configureStore } from "@reduxjs/toolkit";
import packageReducer from "../slices/packageSlice";
import packageDetailReducer from "../slices/packageDetailSlice";
import productReducer from "../slices/productSlice";
import productDetailReducer from "../slices/productDetailSlice";
import authReducer from "../slices/authSlice";
import userReducer from "../slices/userSlice";
import cartReducer from "../slices/cartSlice";

const store = configureStore({
  reducer: {
    packages: packageReducer,
    packageDetail: packageDetailReducer,
    products: productReducer,
    productDetail: productDetailReducer,
    auth: authReducer,
    user: userReducer,
    cart: cartReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

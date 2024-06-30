import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import Toast from "react-native-toast-message";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  productImage?: string;
  brandID?: {
    name: string;
  };
}

interface CartState {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

const getInitialCartState = (): CartState => {
  const cookieCart = Cookies.get("cart");
  if (cookieCart) {
    return JSON.parse(cookieCart);
  }
  return {
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
  };
};

const initialState: CartState = getInitialCartState();

const saveCartToCookies = (state: CartState) => {
  Cookies.set("cart", JSON.stringify(state), { expires: 99999999999 });
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push({ ...newItem, quantity: newItem.quantity });
      }
      state.totalQuantity += newItem.quantity;
      state.totalPrice += newItem.price * newItem.quantity;
      saveCartToCookies(state);
      Toast.show({
        type: "success",
        text1: `Thêm ${newItem.name} thành công`,
      });
    },
    removeFromCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalPrice -= existingItem.price * existingItem.quantity;
        state.items = state.items.filter((item) => item.id !== id);
        saveCartToCookies(state);
      }
    },
    updateCartQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        state.totalQuantity += quantity - existingItem.quantity;
        state.totalPrice +=
          (quantity - existingItem.quantity) * existingItem.price;
        existingItem.quantity = quantity;
        saveCartToCookies(state);
      }
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      Cookies.remove("cart");
    },
  },
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;

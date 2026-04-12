import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ApiService from '../../services/api';
import { Cart, CartResponse, AddToCartPayload, UpdateCartPayload } from '../../types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
};

// --- Thunks ---

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getCart();
      console.log("FETCH CART SUCCESS:", response);
      // Backend returns data as an array [Cart]
      const cartData = Array.isArray(response.data) ? response.data[0] : response.data;
      return cartData;
    } catch (error: any) {
      console.error("FETCH CART ERROR:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async (payload: AddToCartPayload, { dispatch, getState, rejectWithValue }) => {
    try {
      const state = getState() as { cart: CartState };
      const currentCart = state.cart.cart;

      console.log("ADD TO CART PAYLOAD:", payload);

      // Search in existing cart items
      const existingItem = currentCart?.items?.find(item => 
        item.menu_item_id === payload.menu_item_id && 
        (item.selected_options?.length || 0) === (payload.selected_options?.length || 0) &&
        (item.selected_options || []).every(opt => payload.selected_options.includes(opt.id))
      );

      if (existingItem) {
        console.log("MATCH FOUND: Updating existing item", existingItem.cart_item_id);
        const newQuantity = existingItem.quantity + payload.quantity;
        const response = await ApiService.updateCartItem(existingItem.cart_item_id, { quantity: newQuantity });
        return Array.isArray(response.data) ? response.data[0] : response.data;
      } else {
        console.log("NO MATCH: Adding as new item");
        const response = await ApiService.addToCart(payload);
        return Array.isArray(response.data) ? response.data[0] : response.data;
      }
    } catch (error: any) {
      console.error("ADD TO CART ERROR:", error.response?.data || error.message);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to add to cart';
      return rejectWithValue(errorMsg);
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateItemQuantity',
  async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }, { rejectWithValue }) => {
    try {
      if (quantity <= 0) {
        const response = await ApiService.deleteCartItem(cartItemId);
        return Array.isArray(response.data) ? response.data[0] : response.data;
      }
      const response = await ApiService.updateCartItem(cartItemId, { quantity });
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error: any) {
      console.error("UPDATE QUANTITY ERROR:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update quantity');
    }
  }
);

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (cartItemId: string, { rejectWithValue }) => {
    try {
      const response = await ApiService.deleteCartItem(cartItemId);
      return Array.isArray(response.data) ? response.data[0] : response.data;
    } catch (error: any) {
      console.error("REMOVE ITEM ERROR:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.error = null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add/Update/Delete all return the full Cart object in response
      .addMatcher(
        (action: any) => [addItemToCart.fulfilled.type, updateItemQuantity.fulfilled.type, removeCartItem.fulfilled.type].includes(action.type),
        (state, action: PayloadAction<Cart>) => {
          state.isLoading = false;
          state.cart = action.payload;
          state.error = null;
        }
      )
      .addMatcher(
        (action: any) => [addItemToCart.pending.type, updateItemQuantity.pending.type, removeCartItem.pending.type].includes(action.type),
        (state) => {
          state.isLoading = true;
        }
      )
      .addMatcher(
        (action: any) => [addItemToCart.rejected.type, updateItemQuantity.rejected.type, removeCartItem.rejected.type].includes(action.type),
        (state, action: any) => {
          state.isLoading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;

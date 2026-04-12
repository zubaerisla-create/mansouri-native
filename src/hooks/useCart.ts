import { useContext } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';
import { 
  fetchCart, 
  addItemToCart, 
  updateItemQuantity, 
  removeCartItem, 
  clearCart 
} from '../store/slices/cartSlice';
import { AddToCartPayload } from '../types';
import { useCart as useLegacyCart } from '../context/CartContext';

export const useCart = () => {
  const dispatch = useAppDispatch();
  const { cart, isLoading, error } = useAppSelector((state) => state.cart);
  
  // Bridge to legacy context for favorites and other non-cart features
  const { toggleFavorite, isFavorite } = useLegacyCart();

  const handleFetchCart = () => dispatch(fetchCart());

  const handleAddToCart = (payload: AddToCartPayload) => 
    dispatch(addItemToCart(payload));

  const handleUpdateQuantity = (cartItemId: string, quantity: number) => 
    dispatch(updateItemQuantity({ cartItemId, quantity }));

  const handleRemoveItem = (cartItemId: string) => 
    dispatch(removeCartItem(cartItemId));

  const handleClearCart = () => dispatch(clearCart());

  const getTotalItems = () => {
    return (cart?.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
  };

  const getTotalPrice = () => {
    return parseFloat(cart?.total || '0');
  };

  return {
    cart,
    isLoading,
    error,
    fetchCart: handleFetchCart,
    addToCart: handleAddToCart,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
    clearCart: handleClearCart,
    toggleFavorite,
    isFavorite,
    getTotalItems,
    getTotalPrice,
  };
};

// cartContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  restaurantId: string;
  restaurantName?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  extras?: { extraCheese?: boolean; bacon?: boolean; avocado?: boolean };
  spicyLevel?: string;
  image?: string;
}

interface RestaurantInfo {
  id: string;
  name: string;
  cuisine: string;
  image: string;
  rating: number;
  deliveryTime: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

// Define consistent status types
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  restaurantName: string;
  orderId: string;
  dateTime: string;
  total: string;
  status: OrderStatus;
  rating?: number;
  canRate?: boolean;
  items?: OrderItem[];
  deliveryAddress?: string;
  paymentMethod?: string;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
  restaurantCuisine?: string;
  restaurantDistance?: string;
  restaurantImage?: string;
  carModel?: string;
  carColor?: string;
  plateNumber?: string;
}

interface CartContextType {
  cart: CartItem[];
  currentRestaurantId: string | null;
  favorites: RestaurantInfo[];
  orderHistory: Order[];
  addToCart: (item: CartItem) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setCurrentRestaurant: (restaurantId: string) => void;
  addQuantity: (itemId: string) => void;
  subtractQuantity: (itemId: string) => void;
  toggleFavorite: (restaurant: RestaurantInfo) => void;
  isFavorite: (restaurantId: string) => boolean;
  removeFavorite: (restaurantId: string) => void;
  addOrderToHistory: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  rateOrder: (orderId: string, rating: number) => void;
  getOrderById: (orderId: string) => Order | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<RestaurantInfo[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // Add order to history
  const addOrderToHistory = (order: Order) => {
    setOrderHistory(prev => {
      // Check if order already exists
      const existingIndex = prev.findIndex(o => o.id === order.id || o.orderId === order.orderId);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = order;
        return updated.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      
      // Add new order and sort by date (newest first)
      return [order, ...prev].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  };

  // Update order status
  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrderHistory(prev => 
      prev.map(order => 
        order.id === orderId || order.orderId === orderId
          ? { 
              ...order, 
              status, 
              updatedAt: new Date(),
              ...(status === 'delivered' ? { canRate: true } : {})
            }
          : order
      )
    );
  };

  // Rate an order
  const rateOrder = (orderId: string, rating: number) => {
    setOrderHistory(prev => 
      prev.map(order => 
        order.id === orderId || order.orderId === orderId
          ? { ...order, rating, canRate: false }
          : order
      )
    );
  };

  // Get order by ID
  const getOrderById = (orderId: string) => {
    return orderHistory.find(order => 
      order.id === orderId || order.orderId === orderId
    );
  };

  // Rest of the functions remain the same...
  const toggleFavorite = (restaurant: RestaurantInfo) => {
    setFavorites(prev => {
      const isAlreadyFavorite = prev.some(fav => fav.id === restaurant.id);
      if (isAlreadyFavorite) {
        return prev.filter(fav => fav.id !== restaurant.id);
      } else {
        return [...prev, restaurant];
      }
    });
  };

  const isFavorite = (restaurantId: string) => {
    return favorites.some(fav => fav.id === restaurantId);
  };

  const removeFavorite = (restaurantId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== restaurantId));
  };

  const setCurrentRestaurant = (restaurantId: string) => {
    if (currentRestaurantId && currentRestaurantId !== restaurantId) {
      setCart([]);
    }
    setCurrentRestaurantId(restaurantId);
  };

  const addToCart = (newItem: CartItem) => {
    setCart((prev) => {
      if (prev.length === 0) {
        return [newItem];
      }

      if (currentRestaurantId && currentRestaurantId !== newItem.restaurantId) {
        return [newItem];
      }

      const generateItemKey = (item: CartItem) => {
        return `${item.id}-${item.size}-${JSON.stringify(item.extras)}-${item.spicyLevel}`;
      };

      const newItemKey = generateItemKey(newItem);
      
      const existingIndex = prev.findIndex(
        (i) => generateItemKey(i) === newItemKey
      );

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + newItem.quantity,
        };
        return updated;
      }

      return [...prev, newItem];
    });
    
    setCurrentRestaurantId(newItem.restaurantId);
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
    } else {
      setCart(prev => prev.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: Math.max(1, quantity) };
        }
        return item;
      }));
    }
  };

  const addQuantity = (itemId: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    }));
  };

  const subtractQuantity = (itemId: string) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQuantity = item.quantity - 1;
        if (newQuantity < 1) {
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const getTotalPrice = () =>
    cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const clearCart = () => {
    setCart([]);
    setCurrentRestaurantId(null);
  };

  return (
    <CartContext.Provider
      value={{ 
        cart, 
        currentRestaurantId,
        favorites,
        orderHistory,
        addToCart, 
        getTotalItems, 
        getTotalPrice, 
        clearCart,
        removeFromCart,
        updateQuantity,
        addQuantity,
        subtractQuantity,
        setCurrentRestaurant,
        toggleFavorite,
        isFavorite,
        removeFavorite,
        addOrderToHistory,
        updateOrderStatus,
        rateOrder,
        getOrderById
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
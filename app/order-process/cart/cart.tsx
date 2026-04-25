import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCart } from '@/src/hooks/useCart';
import { useRouter } from 'expo-router';

export default function CartScreen() {
  const { cart, isLoading, fetchCart, updateQuantity, removeItem, clearCart, getTotalItems } = useCart();
  const router = useRouter();
  
  useEffect(() => {
    fetchCart();
  }, []);

  const subtotal = parseFloat(cart?.total || '0');
  const serviceFee = 5.00; // Mock service fee for now
  const total = subtotal + serviceFee;

  const handleRemoveItem = (cartItemId: string, itemName: string) => {
    Alert.alert(
      'Remove Item',
      `Remove ${itemName} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => removeItem(cartItemId)
        },
      ]
    );
  };

  const handleClearCart = () => {
    if (!cart || !cart.items || cart.items.length === 0) return;
    
    Alert.alert(
      'Clear Cart',
      'Remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: () => clearCart()
        },
      ]
    );
  };

  const handleProceedToCheckout = () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to cart first');
      return;
    }
    
    // Navigate to checkout screen
    router.push({
      pathname: '/order-process/checkout/checkout',
      params: { branch_id: cart.branch_id }
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Cart</Text>
        </View>
        <Text className="text-gray-600">{getTotalItems()} items</Text>
      </View>

      {isLoading && !cart ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : (!cart || !cart.items || cart.items.length === 0) ? (
        <View className="flex-1 justify-center items-center p-5">
          <Feather name="shopping-cart" size={64} color="#ddd" />
          <Text className="text-xl text-gray-500 mt-4">Your cart is empty</Text>
          <Text className="text-gray-400 mt-2">Add items to get started</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-6 bg-orange-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView 
            className="flex-1"
            showsVerticalScrollIndicator={false}
          >
            <View className="p-5">
              {cart.items.map((item, index) => (
                <View 
                  key={item.cart_item_id}
                  className={`bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm ${index === (cart.items?.length || 0) - 1 ? 'mb-6' : ''}`}
                >
                  <View className="flex-row">
                    {/* Item Image */}
                    <Image
                      source={{ uri: item.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop' }}
                      className="w-20 h-20 rounded-lg mr-4"
                      resizeMode="cover"
                    />
                    
                    {/* Item Details */}
                    <View className="flex-1">
                      <View className="flex-row justify-between">
                        <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
                          {item.name}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveItem(item.cart_item_id, item.name)}
                          className="p-1"
                        >
                          <Feather name="x" size={20} color="#999" />
                        </TouchableOpacity>
                      </View>
                      
                      {/* Item Customizations */}
                      <View className="mt-1">
                        {item.selected_options.map((opt) => (
                          <Text key={opt.id} className="text-sm text-gray-600">
                            • {opt.name} ({parseFloat(opt.price).toFixed(2)} SAR)
                          </Text>
                        ))}
                      </View>
                      
                      {/* Price and Quantity */}
                      <View className="flex-row items-center justify-between mt-3">
                        <Text className="text-lg font-bold text-gray-900">
                          {parseFloat(item.item_price).toFixed(2)} SAR
                        </Text>
                        
                        {/* Quantity Controls */}
                        <View className="flex-row items-center bg-gray-100 rounded-full px-3 py-1">
                          <TouchableOpacity 
                            onPress={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                            className="px-2"
                          >
                            <Feather name="minus" size={18} color="#666" />
                          </TouchableOpacity>
                          <Text className="text-base font-bold mx-4 min-w-[20px] text-center">
                            {item.quantity}
                          </Text>
                          <TouchableOpacity 
                            onPress={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                            className="px-2"
                          >
                            <Feather name="plus" size={18} color="#666" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      
                      {/* Item Total */}
                      <View className="mt-2 pt-2 border-t border-gray-100">
                        <Text className="text-right text-gray-700">
                          Total: <Text className="font-bold">{parseFloat(item.subtotal).toFixed(2)} SAR</Text>
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Note Section */}
            <View className="px-5 pb-5">
              <Text className="text-lg font-semibold text-gray-900 mb-3">Note</Text>
              <TextInput
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 min-h-[100px]"
                placeholder="Add special instructions, allergies, or delivery notes..."
                placeholderTextColor="#999"
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Order Summary */}
            <View className="px-5 pb-32">
              <Text className="text-lg font-semibold text-gray-900 mb-4">Order Summary</Text>
              <View className="bg-gray-50 rounded-xl p-4">
              
                
                {/* Order Breakdown */}
                <View className="mt-2">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-500 text-sm">Items Total</Text>
                    <Text className="text-gray-900 text-sm">{subtotal.toFixed(2)} SAR</Text>
                  </View>
                </View>
                
                {/* Totals */}
                <View className="mt-4 pt-3 border-t border-gray-200">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Subtotal</Text>
                    <Text className="text-gray-900 font-medium">{subtotal.toFixed(2)} SAR</Text>
                  </View>
                  
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-600">Service Fee</Text>
                    <Text className="text-gray-900 font-medium">{serviceFee.toFixed(2)} SAR</Text>
                  </View>
                  
                  <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-300">
                    <Text className="text-lg font-bold text-gray-900">Total</Text>
                    <Text className="text-lg font-bold text-orange-600">{total.toFixed(2)} SAR</Text>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Proceed to Checkout Button */}
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
            <TouchableOpacity
              onPress={handleProceedToCheckout}
              className="bg-orange-600 py-4 rounded-xl items-center shadow-lg"
            >
              <Text className="text-white text-xl font-bold">
                Proceed to Checkout • {total.toFixed(2)} SAR
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleClearCart}
              className="mt-3 items-center"
            >
              <Text className="text-red-500 font-medium">Clear Cart</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, View, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/src/hooks/useTranslation';
import { AppText as Text } from '../AppText';

// API Service - You'll need to implement this based on your backend
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface Order {
  id: string;
  restaurantName: string;
  orderId: string;
  dateTime: string;
  total: string;
  status: 'Preparing' | 'Pending' | 'Completed' | 'Delivered' | 'Cancelled';
  rating?: number;
  canRate?: boolean;
  items?: OrderItem[];
  deliveryAddress?: string;
  paymentMethod?: string;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Mock API service - replace with your actual API calls
const mockOrdersApi = {
  fetchOrders: async (): Promise<Order[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // This would come from your backend
    const currentDate = new Date();
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    
    return [
      {
        id: '1',
        restaurantName: 'Burger House',
        orderId: `ORD${Math.floor(Math.random() * 10000)}`,
        dateTime: currentDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }) + ' • ' + currentDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        total: `${(Math.random() * 100 + 20).toFixed(2)} SAR`,
        status: 'Preparing',
        items: [
          { id: '1', name: 'Classic Burger', quantity: 2, price: 12.99 },
          { id: '2', name: 'Fries', quantity: 1, price: 4.99 },
        ],
        deliveryAddress: '123 Main St, City',
        paymentMethod: 'Credit Card',
        createdAt: currentDate,
        updatedAt: currentDate,
      },
      {
        id: '2',
        restaurantName: 'Shawarma Express',
        orderId: `ORD${Math.floor(Math.random() * 10000)}`,
        dateTime: previousDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }) + ' • ' + previousDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        total: `${(Math.random() * 100 + 30).toFixed(2)} SAR`,
        status: 'Completed',
        rating: 4,
        items: [
          { id: '3', name: 'Margherita Pizza', quantity: 1, price: 18.99 },
          { id: '4', name: 'Garlic Bread', quantity: 1, price: 5.99 },
        ],
        deliveryAddress: '456 Oak Ave, City',
        paymentMethod: 'Cash',
        createdAt: previousDate,
        updatedAt: previousDate,
      },
      {
        id: '3',
        restaurantName: 'Sushi Express',
        orderId: `ORD${Math.floor(Math.random() * 10000)}`,
        dateTime: previousDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }) + ' • ' + previousDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        total: `${(Math.random() * 100 + 40).toFixed(2)} SAR`,
        status: 'Delivered',
        canRate: true,
        items: [
          { id: '5', name: 'California Roll', quantity: 2, price: 14.99 },
          { id: '6', name: 'Miso Soup', quantity: 1, price: 3.99 },
        ],
        deliveryAddress: '789 Pine Rd, City',
        paymentMethod: 'Digital Wallet',
        createdAt: previousDate,
        updatedAt: previousDate,
      },
      {
        id: '4',
        restaurantName: 'Taco Fiesta',
        orderId: `ORD${Math.floor(Math.random() * 10000)}`,
        dateTime: previousDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }) + ' • ' + previousDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        total: `${(Math.random() * 100 + 25).toFixed(2)} SAR`,
        status: 'Cancelled',
        items: [
          { id: '7', name: 'Beef Tacos', quantity: 3, price: 8.99 },
        ],
        deliveryAddress: '321 Elm St, City',
        paymentMethod: 'Credit Card',
        createdAt: previousDate,
        updatedAt: previousDate,
      },
    ];
  },
  
  rateOrder: async (orderId: string, rating: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Rated order ${orderId} with ${rating} stars`);
  },
  
  cancelOrder: async (orderId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Cancelled order ${orderId}`);
  },
  
  reorder: async (orderId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Reorder requested for ${orderId}`);
  },
};

export function OrderHistoryScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t, isRTL } = useTranslation();
  

  const fetchOrders = async () => {
    try {
      setError(null);
      const data = await mockOrdersApi.fetchOrders();
      // Sort by date (newest first)
      const sortedData = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedData);
    } catch (err) {
      setError(t('tryAgainError'));
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleRateOrder = async (orderId: string, rating: number) => {
    try {
      await mockOrdersApi.rateOrder(orderId, rating);
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, rating, canRate: false } 
          : order
      ));
    } catch (err) {
      console.error('Error rating order:', err);
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      await mockOrdersApi.reorder(orderId);
      // Navigate to cart or restaurant page
      Alert.alert(t('ok'), 'Order added to cart!');
    } catch (err) {
      console.error('Error reordering:', err);
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Preparing':
        return 'bg-blue-100 text-blue-600';
      case 'Pending':
        return 'bg-orange-100 text-orange-600';
      case 'Completed':
      case 'Delivered':
        return 'bg-green-100 text-green-600';
      case 'Cancelled':
        return 'bg-red-100 text-red-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: Order['status']) => {
    return t(status.toLowerCase());
  };

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View className="bg-white mx-4 mb-4 rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-1">
         <View className={`flex-row justify-between pb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text bold className={`text-lg font-semibold text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
              {item.restaurantName}
            </Text>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
              <Text className={`text-xs font-medium ${getStatusColor(item.status).split(' ')[1]}`}>
                {getStatusText(item.status)}
              </Text>
            </View>
         </View>
         <View className={`flex-row justify-between ${isRTL ? 'flex-row-reverse' : ''}`} >
            <Text className="text-xs text-gray-500 mt-1">{t('orderIdText')}</Text>
            <Text>
               {item.orderId}
            </Text>
         </View>
        </View>
      
      </View>

      {/* Order Details */}
      <View className="space-y-2">
        <View className={`flex-row justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-sm text-gray-600">{t('dateTime')}</Text>
          <Text className="text-sm font-medium text-gray-900">{item.dateTime}</Text>
        </View>
        
        {item.items && item.items.length > 0 && (
          <View className="mb-2">
          
            
          </View>
        )}
        
    
        
        <View className={`flex-row justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Text className="text-sm text-gray-600">{t('total')}</Text>
          <Text className="text-sm font-bold text-orange-600">{item.total}</Text>
        </View>
      </View>

      {/* Actions Section */}
      <View className="mt-3 pt-3 border-t border-gray-100">
        {item.status === 'Completed' || item.status === 'Delivered' ? (
          <View>
            {item.rating ? (
              <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Text className={`text-sm text-gray-600 ${isRTL ? 'ml-2' : 'mr-2'}`}>{t('myRating')}</Text>
                <View className={`flex-row ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Feather
                      key={star}
                      name="star"
                      size={16}
                      color={star <= (item.rating || 0) ? "#FFB800" : "#D1D5DB"}
                      style={{ [isRTL ? 'marginLeft' : 'marginRight']: 2 }}
                    />
                  ))}
                </View>
              </View>
            ) : item.canRate ? (
              <TouchableOpacity 
                className={`flex-row items-center justify-center py-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                onPress={() => handleRateOrder(item.id, 5)} // Default 5 stars
              >
                <Text bold className="text-sm font-medium text-orange-600 mr-1">{t('rateNow')}</Text>
                <Feather name={isRTL ? "arrow-left" : "arrow-right"} size={16} color="#EA580C" />
              </TouchableOpacity>
            ) : null}
            
    
          </View>
        ) : item.status === 'Preparing' || item.status === 'Pending' ? (
          <TouchableOpacity 
            className="flex-row items-center justify-center py-2 bg-red-50 rounded-lg"
            onPress={() => Alert.alert(t('error'), t('contactSupportCancel'))}
          >
          
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 w-full justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-600 mt-4">{t('loadingOrders')}</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 w-full justify-center items-center">
        <Feather name="alert-circle" size={64} color="#EF4444" />
        <Text className="text-lg text-red-600 mt-4">{error}</Text>
        <TouchableOpacity 
          className="mt-4 px-6 py-3 bg-blue-600 rounded-lg"
          onPress={fetchOrders}
        >
          <Text bold className="text-white font-medium">{t('tryAgain')}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 w-full" style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
      {/* Header */}
      <View className={`px-4 py-4 border-b border-gray-100 w-full ${isRTL ? 'items-end' : 'items-start'}`}>
        <Text bold className="text-2xl font-bold text-gray-900">{t('orderHistory')}</Text>
        <Text className="text-gray-600 mt-1">{t('recentOrders')}</Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
          />
        }
        className="w-full"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        ListEmptyComponent={() => (
          <View className="flex-1 justify-center items-center py-20">
            <Feather name="shopping-bag" size={64} color="#D1D5DB" />
            <Text className="text-lg text-gray-500 mt-4">{t('noOrders')}</Text>
            <Text className="text-gray-400 mt-2">{t('placeFirstOrder')}</Text>
          </View>
        )}
        ListHeaderComponent={() => (
          orders.length > 0 && (
            <View className={`px-4 mb-2 ${isRTL ? 'items-end' : 'items-start'}`}>
              <Text className="text-gray-600">
                {orders.length === 1 
                  ? t('showingOrder').replace('{count}', orders.length.toString())
                  : t('showingOrders').replace('{count}', orders.length.toString())}
              </Text>
            </View>
          )
        )}
      />
    </SafeAreaView>
  );
}
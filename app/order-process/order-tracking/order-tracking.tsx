import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function OrderTrackingScreen() {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState('preparing');
  const [timeRemaining, setTimeRemaining] = useState(25); // in minutes

  useEffect(() => {
    const timer = setInterval(() => {
      if (timeRemaining > 0) {
        setTimeRemaining(timeRemaining - 1);
      } else {
        setOrderStatus('ready');
      }
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const statusSteps = [
    { id: 'confirmed', label: 'Confirmed', icon: 'check-circle' },
    { id: 'preparing', label: 'Preparing', icon: 'clock' },
    { id: 'ready', label: 'Ready', icon: 'package' },
    { id: 'picked', label: 'Picked Up', icon: 'check' },
  ];

  const activeStepIndex = statusSteps.findIndex(step => step.id === orderStatus);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 p-5">
        {/* Header */}
        <View className="items-center mb-8">
          <Feather name="check-circle" size={80} color="#10b981" />
          <Text className="text-2xl font-bold text-gray-900 mt-4">Order Confirmed!</Text>
          <Text className="text-gray-600 mt-2">Order #ORD-{Date.now().toString().slice(-6)}</Text>
        </View>

        {/* Order Status */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-gray-900 mb-6">Order Status</Text>
          
          {/* Status Steps */}
          <View className="flex-row justify-between items-center mb-4">
            {statusSteps.map((step, index) => (
              <View key={step.id} className="items-center">
                <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${
                  index <= activeStepIndex ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                  <Feather 
                    name={step.icon as any} 
                    size={24} 
                    color={index <= activeStepIndex ? 'white' : '#999'} 
                  />
                </View>
                <Text className={`text-sm font-medium ${
                  index <= activeStepIndex ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Time Remaining */}
          {orderStatus === 'preparing' && (
            <View className="bg-orange-50 p-4 rounded-xl items-center">
              <Text className="text-lg font-semibold text-orange-700">
                Estimated Time: {timeRemaining} min
              </Text>
              <Text className="text-orange-600 text-sm mt-1">
                Your order is being prepared
              </Text>
            </View>
          )}

          {orderStatus === 'ready' && (
            <View className="bg-green-50 p-4 rounded-xl items-center">
              <Text className="text-lg font-semibold text-green-700">
                Order is Ready for Pickup!
              </Text>
              <Text className="text-green-600 text-sm mt-1">
                Please proceed to the restaurant
              </Text>
            </View>
          )}
        </View>

        {/* Pickup Details */}
        <View className="bg-gray-50 rounded-xl p-4 mb-8">
          <Text className="text-lg font-bold text-gray-900 mb-3">Pickup Details</Text>
          
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Restaurant</Text>
              <Text className="text-gray-900 font-medium">Burger House</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Pickup Time</Text>
              <Text className="text-gray-900 font-medium">30 minutes</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Car</Text>
              <Text className="text-gray-900 font-medium">Toyota Camry (Black)</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Payment</Text>
              <Text className="text-gray-900 font-medium">Credit Card • 77.05 SAR</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="space-y-3">
          <TouchableOpacity
            // onPress={() => router.push('/(tabs)')}
            className="bg-orange-600 py-4 rounded-xl items-center"
          >
            <Text className="text-white text-lg font-semibold">Order More Food</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            // onPress={() => router.push('/order-history')}
            className="bg-white border border-gray-300 py-4 rounded-xl items-center"
          >
            <Text className="text-gray-700 text-lg font-semibold">View Order History</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
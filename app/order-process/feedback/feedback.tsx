import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const router = useRouter();

  const handleStarPress = (index: number) => {
    setRating(index + 1);
  };

  const handleSubmit = () => {
    // Submit feedback and navigate to order delivered page
    alert(`You gave ${rating} star rating. Thank You 😊`);
    
    // Navigate to order delivered page with orderId and fromFeedback flag
    router.replace({
      pathname: '/order-process/order-status/[orderId]',
      params: { 
        orderId: 'ORD-20260119-7842',
        fromFeedback: 'true'  // Add flag to indicate coming from feedback
      }
    });
  };

  const handleDismiss = () => {
    // Navigate back to home
    alert('OK, let\'s see again 🍔');
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <View className="flex-1 items-center justify-center px-8">
        {/* Green Checkmark */}
        <View className="w-24 h-24 rounded-full bg-green-100 items-center justify-center mb-6">
          <Feather name="check" size={60} color="#22c55e" />
        </View>

        {/* Thank You! */}
        <Text className="text-3xl font-bold text-gray-800 mb-2">
          Thank You!
        </Text>

        {/* Enjoy your meal */}
        <Text className="text-xl text-gray-600 mb-10 text-center">
          Enjoy your meal! 😋
        </Text>

        {/* Give feedback */}
        <Text className="text-lg font-medium text-gray-700 mb-4">
          Give feedback
        </Text>

        {/* Stars with orange-500 fill */}
        <View className="flex-row mb-8">
          {[0, 1, 2, 3, 4].map((index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleStarPress(index)}
              activeOpacity={0.7}
              className="px-2"
            >
              <Feather
                name="star"
                size={36}
                color={index < rating ? '#f97316' : '#d1d5db'} // Orange-500: #f97316
                fill={index < rating ? '#f97316' : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={rating === 0}
          className={`w-full py-4 rounded-xl items-center mb-4 ${
            rating > 0
              ? 'bg-orange-500'
              : 'bg-orange-300 opacity-70'
          }`}
        >
          <Text className="text-white text-lg font-semibold">Submit</Text>
        </TouchableOpacity>

        {/* Dismiss Button */}
        <TouchableOpacity
          onPress={handleDismiss}
          className="w-full py-4 rounded-xl border border-gray-300 items-center"
        >
          <Text className="text-gray-700 text-lg font-medium">Dismiss</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
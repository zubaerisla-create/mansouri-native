import { Link, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  useWindowDimensions,
  Image,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import api from '@/src/services/api';
import { useAppSelector } from '@/src/hooks/useRedux';

const OrderConfirmationScreen = () => {
  const params = useLocalSearchParams<{ orderId: string; orderNumber?: string }>();
  const orderId = params.orderId || 'PEPEEEP-ORDER-12345';
  const { token } = useAppSelector((state) => state.auth);
  
  const qrImageUrl = api.getOrderQrUrl(orderId);
  const { width } = useWindowDimensions();
  
  // Responsive calculations
  const isSmallScreen = width < 375;
  const isLargeScreen = width > 768;
  const qrSize = isSmallScreen ? 200 : isLargeScreen ? 280 : 240;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View className="flex-1 px-6 items-center">
        {/* Image above the title */}
        <View className="mt-20 mb-6 bg-yellow-100 p-4 rounded-full ">
          <Image
            source={{ uri: 'https://i.ibb.co.com/M5ghD7FB/Icon.png' }}
            className="w-12 h-12"
            resizeMode="contain"
          />
        </View>

        {/* Main Title */}
        <Text className="text-3xl font-bold text-black mb-2 text-center">
          Show this to staff
        </Text>
        
        <Text className="text-base text-gray-600 mb-8 text-center">
          Staff can scan code or you can confirm receipt manually
        </Text>

        {/* QR Code Generated Locally from orderId */}
        <View className="items-center mb-8">
          <View 
            className="p-4 bg-white rounded-3xl border-4 border-orange-500 shadow-lg"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            <QRCode
              value={orderId}
              size={qrSize}
              color="black"
              backgroundColor="white"
            />
          </View>
        </View>

        {/* Order Number */}
        <View className="items-center mb-7">
          <Text className="text-sm text-gray-500 mb-1">Order Number</Text>
          <Text className="text-xl font-bold text-black tracking-tight">
            {params.orderNumber || orderId}
          </Text>
        </View>

        {/* Instruction text */}
        <Text className="text-base text-gray-700 mb-8 text-center leading-6 px-3">
          When staff arrives at your car, show this code or tap "I Received the Order"
          after getting your food
        </Text>

        {/* Big green button */}
        <TouchableOpacity 
          className="w-full h-14 bg-green-500 rounded-2xl justify-center items-center mb-6 shadow-xl"
          activeOpacity={0.85}
          style={{
            shadowColor: '#00c853',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => router.push('/order-process/feedback/feedback')}
        >
          <Text className="text-white text-lg font-bold">✓ I Received the Order</Text>
        </TouchableOpacity>

        {/* Back link */}
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="p-3"
        >
          <Text className="text-blue-600 text-base font-medium">Back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OrderConfirmationScreen;
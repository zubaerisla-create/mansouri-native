import { Link, router } from 'expo-router';
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

const OrderConfirmationScreen = () => {
  const orderId = 'PEPEEEP-ORDER-12345';
  const qrValue = 'PEPEEEP-ORDER-12345';
  const { width, height } = useWindowDimensions();
  
  // Responsive calculations
  const isSmallScreen = width < 375;
  const isLargeScreen = width > 768;
  const qrSize = isSmallScreen ? 180 : isLargeScreen ? 260 : 220;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View className="flex-1 px-6 items-center">
        {/* Image above the title */}
        <View className="mt-24 mb-8 bg-yellow-100 p-4 rounded-full ">
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
        
        <Text className="text-base text-gray-600 mb-9 text-center">
          Staff can scan code or you can confirm receipt manually
        </Text>

        {/* QR Code with orange rounded border */}
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
              value={qrValue}
              size={qrSize}
              color="black"
              backgroundColor="white"
              logoSize={50}
            />
          </View>
        </View>

        {/* Order ID */}
        <View className="items-center mb-7">
          <Text className="text-sm text-gray-500 mb-1">Order ID</Text>
          <Text className="text-xl font-bold text-black tracking-tight">
            {orderId}
          </Text>
        </View>

        {/* Instruction text */}
        <Text className="text-base text-gray-700 mb-10 text-center leading-6 px-3">
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
        >
          <Link href="/order-process/feedback/feedback" asChild>
            <Text className="text-white text-lg font-bold">✓ I Received the Order</Text>
          </Link>
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
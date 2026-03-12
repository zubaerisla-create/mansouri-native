import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Link } from 'expo-router';
import { useCart } from '@/src/context/CartContext';

const { width, height } = Dimensions.get('window');

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered';

interface Order {
  id: string;
  status: OrderStatus;
  restaurantName: string;
  restaurantCuisine: string;
  restaurantDistance: string;
  restaurantImage: string;
  countdownSeconds?: number;
  carModel: string;
  carColor: string;
  plateNumber: string;
  itemsCount: number;
  total?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export default function OrderTrackingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ orderId: string; fromFeedback?: string }>();
  const orderId = params.orderId || 'ORD-20260119-7842';
  const fromFeedback = params.fromFeedback === 'true';
  const { clearCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [secondsLeft, setSecondsLeft] = useState<number | undefined>(undefined);
  const [isTakeMeThereVisible, setIsTakeMeThereVisible] = useState(false);

  // Responsive calculations
  const responsiveWidth = (percentage: number) => (width * percentage) / 100;
  const responsiveHeight = (percentage: number) => (height * percentage) / 100;
  const responsiveFontSize = (baseSize: number) => {
    const scale = width / 375; // Base width (iPhone 12/13)
    return baseSize * Math.min(scale, 1.8);
  };

  // Mock order data - in real app fetch from API using orderId
  const MOCK_ORDER: Order = {
    id: orderId,
    status: 'pending',
    restaurantName: 'Burger House',
    restaurantCuisine: 'Burgers',
    restaurantDistance: '1.2 km away',
    restaurantImage: 'https://shorturl.at/RnOWh',
    countdownSeconds: 5,
    carModel: 'Toyota Camry',
    carColor: 'Black',
    plateNumber: 'ABC 123',
    itemsCount: 3,
    total: '68.00',
    items: [
      { name: 'Classic Burger', quantity: 2, price: 15.00 },
      { name: 'French Fries', quantity: 1, price: 8.00 },
    ],
  };

  // Simulate fetching order
  useEffect(() => {
    setTimeout(() => {
      // If coming from feedback page, set status to 'delivered'
      const initialOrder = {
        ...MOCK_ORDER,
        status: fromFeedback ? 'delivered' : MOCK_ORDER.status
      };
      
      setOrder(initialOrder);
      if (initialOrder.countdownSeconds && initialOrder.status === 'pending') {
        setSecondsLeft(initialOrder.countdownSeconds);
      }
      setLoading(false);
    }, 1200);
  }, [orderId, fromFeedback]);

  // Countdown timer
  useEffect(() => {
    if (!secondsLeft || secondsLeft <= 0 || order?.status !== 'pending') return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (!prev || prev <= 1) {
          clearInterval(timer);
          // Auto progress to confirmed
          setOrder((prevOrder) =>
            prevOrder ? { ...prevOrder, status: 'confirmed', countdownSeconds: undefined } : null
          );
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, order?.status]);

  // Auto progress from confirmed to preparing
  useEffect(() => {
    if (order?.status === 'confirmed') {
      const timer = setTimeout(() => {
        setOrder(prevOrder => 
          prevOrder ? { ...prevOrder, status: 'preparing' } : null
        );
      }, 3000); // Wait 3 seconds before moving to preparing
      
      return () => clearTimeout(timer);
    }
  }, [order?.status]);

  const getProgressIndex = (): number => {
    if (!order) return 0;
    const states: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    return states.indexOf(order.status);
  };

  const formatTime = (sec?: number) => {
    if (!sec) return '--';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCancelOrder = () => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => {
          // API call to cancel...
          clearCart();
          router.replace('/(tabs)/home');
        },
      },
    ]);
  };



  const handleTakeMeThere = () => {
    Alert.alert('Navigation', 'Opening navigation to restaurant...');
    // In real app, this would open Google Maps/Apple Maps with restaurant location
  };

  const simulateStatusChange = () => {
    if (!order) return;
    
    const statusOrder: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      setOrder({ ...order, status: nextStatus });
      
      if (nextStatus === 'delivered') {
        Alert.alert('Order Delivered!', 'Your order has been delivered successfully!');
      }
    }
  };

  const handleBackToHome = () => {
    clearCart();
    router.replace('/(tabs)/home');
  };

  if (loading || !order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <ActivityIndicator size="large" color="#fb923c" />
        <Text style={{ fontSize: responsiveFontSize(14), marginTop: responsiveHeight(2) }} className="text-gray-600">
          Loading order status...
        </Text>
      </SafeAreaView>
    );
  }

  const progressIndex = getProgressIndex();
  const isPending = order.status === 'pending';
  const isConfirmed = order.status === 'confirmed';
  const isPreparing = order.status === 'preparing';
  const isReady = order.status === 'ready';
  const isDelivered = order.status === 'delivered';

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Header Status Circle */}
        <View className="items-center" style={{ marginTop: responsiveHeight(3), marginBottom: responsiveHeight(2) }}>
          <View
            className={`rounded-full items-center justify-center border-8 ${
              isDelivered ? 'border-green-500 bg-green-50' : 'border-orange-400 bg-orange-50'
            }`}
            style={{
              width: responsiveWidth(35),
              height: responsiveWidth(35),
              borderWidth: responsiveWidth(2),
            }}
          >
            {isDelivered ? (
              <Feather name="check" size={responsiveFontSize(52)} color="#22c55e" />
            ) : (
              <>
                <Text style={{ fontSize: responsiveFontSize(32) }} className="font-bold text-orange-600">
                  {isPending ? formatTime(secondsLeft) : 'Ready!'}
                </Text>
                {isPending && <Text style={{ fontSize: responsiveFontSize(12) }} className="text-orange-700">sec</Text>}
              </>
            )}
          </View>

          <Text 
            style={{ 
              fontSize: responsiveFontSize(24),
              marginTop: responsiveHeight(1.5),
              marginHorizontal: responsiveWidth(5),
            }}
            className="font-bold text-gray-900 text-center"
          >
            {isPending && 'Order Pending!'}
            {isConfirmed && 'Order Confirmed!'}
            {isPreparing && 'Your order is prepared'}
            {isReady && 'Ready for Pickup!'}
            {isDelivered && 'Order Delivered!'}
          </Text>

          <Text 
            style={{
              fontSize: responsiveFontSize(14),
              marginTop: responsiveHeight(0.5),
              marginHorizontal: responsiveWidth(8),
            }}
            className="text-gray-600 text-center"
          >
            {isPending && 'Waiting for Restaurant to Accept Order'}
            {isConfirmed && 'Your order is being prepared'}
            {isPreparing && 'Your order is Ready'}
            {isReady && 'Your order is ready for pickup'}
            {isDelivered && 'Your order has been delivered'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={{ paddingHorizontal: responsiveWidth(8), marginBottom: responsiveHeight(3) }}>
          <View className="flex-row justify-between items-center">
            {['Order Sent',  'Preparing', 'Ready', 'Delivered'].map(
              (label, i) => (
                <View key={label} className="items-center" style={{ flex: 1 }}>
                  <View
                    className={`rounded-full border-2 ${
                      i <= progressIndex
                        ? 'bg-orange-500 border-orange-500'
                        : 'bg-white border-gray-300'
                    }`}
                    style={{
                      width: responsiveWidth(4.5),
                      height: responsiveWidth(4.5),
                      borderWidth: responsiveWidth(0.4),
                    }}
                  />
                  <Text
                    style={{ fontSize: responsiveFontSize(10) }}
                    className={`mt-1 text-center ${
                      i <= progressIndex ? 'text-orange-600 font-medium' : 'text-gray-500'
                    }`}
                  >
                    {label}
                  </Text>
                </View>
              )
            )}
          </View>

          {/* Connecting line */}
          <View 
            className="absolute bg-gray-200 -z-10"
            style={{
              top: responsiveHeight(1),
              left: responsiveWidth(8),
              right: responsiveWidth(8),
              height: responsiveWidth(0.3),
            }}
          />
          <View
            className="absolute bg-orange-500 -z-10"
            style={{
              top: responsiveHeight(1),
              left: responsiveWidth(8),
              height: responsiveWidth(0.3),
              width: `${(progressIndex / 4) * (width - responsiveWidth(16))}%`,
            }}
          />
        </View>

        {/* Take me there text - Show for preparing and ready status */}
        {(isPreparing || isReady) && (
          <View 
            className="mx-5 mb-4"
            style={{
              marginHorizontal: responsiveWidth(5),
              marginBottom: responsiveHeight(1),
            }}
          >
            <TouchableOpacity
              onPress={handleTakeMeThere}
              className="flex-row justify-center bg-orange-500 p-4 ml-16 mr-16 rounded-2xl"
            >
              <Feather name="map-pin" size={20} color="#ffffff" style={{ marginRight: 8 }} />
              <Text 
                style={{ 
                  fontSize: responsiveFontSize(18),
                  textAlign: 'center',
                }}
                className="font-bold text-white"
              >
                Take me there
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Restaurant Card */}
        <View 
          className="mx-5 mb-6 bg-white rounded-2xl shadow-sm border border-gray-100"
          style={{
            padding: responsiveWidth(4),
            marginHorizontal: responsiveWidth(5),
            marginBottom: responsiveHeight(2),
          }}
        >
          <View className="flex-row items-center">
            <Image
              source={{ uri: order.restaurantImage }}
              className="rounded-xl mr-3"
              style={{
                width: responsiveWidth(16),
                height: responsiveWidth(16),
              }}
            />
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text 
                  style={{ fontSize: responsiveFontSize(18) }}
                  className="font-semibold text-gray-900"
                >
                  {order.restaurantName}
                </Text>
                <View
                  className={`px-3 py-1 rounded-full ${
                    isDelivered
                      ? 'bg-green-100'
                      : isPending
                      ? 'bg-orange-100'
                      : 'bg-blue-100'
                  }`}
                  style={{
                    paddingHorizontal: responsiveWidth(3),
                    paddingVertical: responsiveHeight(0.5),
                  }}
                >
                  <Text
                    style={{ fontSize: responsiveFontSize(10) }}
                    className={`font-medium ${
                      isDelivered
                        ? 'text-green-700'
                        : isPending
                        ? 'text-orange-700'
                        : 'text-blue-700'
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: responsiveFontSize(14) }} className="text-gray-600">
                {order.restaurantCuisine}
              </Text>
              <View className="flex-row items-center mt-1">
                <Feather name="map-pin" size={responsiveFontSize(14)} color="#666" />
                <Text style={{ fontSize: responsiveFontSize(12) }} className="text-gray-600 ml-1">
                  {order.restaurantDistance}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Your Car Info */}
        <View 
          className="mx-5 mb-8 bg-white rounded-2xl shadow-sm border border-gray-100"
          style={{
            padding: responsiveWidth(5),
            marginHorizontal: responsiveWidth(5),
            marginBottom: responsiveHeight(2.5),
          }}
        >
          <Text 
            style={{ fontSize: responsiveFontSize(18) }}
            className="font-semibold text-gray-900 mb-4"
          >
            Your Car
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between">
              <Text style={{ fontSize: responsiveFontSize(14) }} className="text-gray-600">
                Car Model
              </Text>
              <Text style={{ fontSize: responsiveFontSize(14) }} className="text-gray-900 font-medium">
                {order.carModel}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text style={{ fontSize: responsiveFontSize(14) }} className="text-gray-600">
                Car Color
              </Text>
              <Text style={{ fontSize: responsiveFontSize(14) }} className="text-gray-900 font-medium">
                {order.carColor}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text style={{ fontSize: responsiveFontSize(14) }} className="text-gray-600">
                Plate Number
              </Text>
              <Text style={{ fontSize: responsiveFontSize(14) }} className="text-gray-900 font-medium">
                {order.plateNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <View 
            className="mx-5 mb-8 bg-white rounded-2xl shadow-sm border border-gray-100"
            style={{
              padding: responsiveWidth(5),
              marginHorizontal: responsiveWidth(5),
              marginBottom: responsiveHeight(2.5),
            }}
          >
            <Text 
              style={{ fontSize: responsiveFontSize(18) }}
              className="font-semibold text-gray-900 mb-4"
            >
              Order Items
            </Text>
            <View className="space-y-2">
              {order.items.map((item, index) => (
                <View key={index} className="flex-row justify-between">
                  <Text style={{ fontSize: responsiveFontSize(14) }} className="text-gray-600">
                    {item.name} ×{item.quantity}
                  </Text>
                  <Text style={{ fontSize: responsiveFontSize(14) }} className="text-gray-900 font-medium">
                    {(item.price * item.quantity).toFixed(2)} SAR
                  </Text>
                </View>
              ))}
              {order.total && (
                <>
                  <View 
                    className="bg-gray-300 my-2"
                    style={{ height: responsiveWidth(0.1) }}
                  />
                  <View className="flex-row justify-between">
                    <Text style={{ fontSize: responsiveFontSize(18) }} className="font-bold text-gray-900">
                      Total
                    </Text>
                    <Text style={{ fontSize: responsiveFontSize(18) }} className="font-bold text-orange-600">
                      {order.total} SAR
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View 
          className="px-5 mb-10"
          style={{
            paddingHorizontal: responsiveWidth(5),
            marginBottom: responsiveHeight(5),
          }}
        >
          {isPending && (
            <TouchableOpacity
              onPress={handleCancelOrder}
              className="bg-red-500 rounded-xl items-center shadow-md mb-3"
              style={{
                paddingVertical: responsiveHeight(2.5),
              }}
            >
              <Text style={{ fontSize: responsiveFontSize(18) }} className="text-white font-bold">
                Cancel Order
              </Text>
            </TouchableOpacity>
          )}

          {/* Peep Button for Confirmed and Preparing Status */}
          {(isConfirmed || isPreparing) && (


<View>

<View className='bg-[#2563EB0D] p-2 rounded-2xl items-center justify-center mb-4 pt-4 pb-4' >

  <Text className='font-bold' >
    I've Arrived!
  </Text>

  <Text className='text-[#64748B]' >
    Tap to notify the restaurant
  </Text>

  <Text className='text-[#64748B]' >
    The restaurant will be notified and will bring your order to your car
  </Text>

  </View>



        <TouchableOpacity
 
  className="bg-[#FFE415] rounded-xl items-center shadow-md mb-4 ml-16 mr-16 flex-row justify-center"
  style={{
    paddingVertical: responsiveHeight(2.5),
  }}
> 
  <Text style={{ fontSize: responsiveFontSize(18) }}  className="text-black pr-4 font-bold mr-2">
    Pepeep
  </Text>
  <Image 
    source={{uri: 'https://i.ibb.co.com/XxL2hrrv/picon-horn.png'}} 
    style={{ width: 24, height: 24 }} 
  />
</TouchableOpacity>

  </View>

          )}

          {/* Different buttons for preparing vs confirmed */}
          {isConfirmed && (
            <TouchableOpacity
              onPress={() => {
                // Simulate moving to preparing status
                setOrder(prevOrder => 
                  prevOrder ? { ...prevOrder, status: 'preparing' } : null
                );
              }}
              className="bg-orange-500 rounded-xl items-center shadow-md mb-4"
              style={{
                paddingVertical: responsiveHeight(2.5),
              }}
            >
              <Text style={{ fontSize: responsiveFontSize(14) }} className="text-white font-bold">
                Display QR-Code to Confirm Delivery
              </Text>
            </TouchableOpacity>
          )}

          {isPreparing && (
               <Link href="/order-process/showQrCode/showQrCode" asChild>
                <TouchableOpacity
                  className="bg-orange-600 rounded-xl items-center shadow-md mb-4"
                  style={{
                    paddingVertical: responsiveHeight(2.5),
                  }}
                >
                  <Text style={{ fontSize: responsiveFontSize(16) }} className="text-white font-bold">
                    Display QR-Code to Confirm Delivery
                  </Text>
                </TouchableOpacity>
              </Link>
          )}

          {isReady && (
            <>
              <TouchableOpacity
                
                className="bg-yellow-500 rounded-xl items-center shadow-md mb-4 flex-row justify-center"
                style={{
                  paddingVertical: responsiveHeight(2.5),
                }}
              >
                <Text style={{ fontSize: responsiveFontSize(18) }} className="text-white font-bold mr-2">
                  Peep
                </Text>
                <Feather name="radio" size={responsiveFontSize(24)} color="white" />
              </TouchableOpacity>

              <Link href="/order-process/showQrCode/showQrCode" asChild>
                <TouchableOpacity
                  className="bg-green-600 rounded-xl items-center shadow-md mb-4"
                  style={{
                    paddingVertical: responsiveHeight(2.5),
                  }}
                >
                  <Text style={{ fontSize: responsiveFontSize(18) }} className="text-white font-bold">
                    Show QR Code
                  </Text>
                </TouchableOpacity>
              </Link>

              <TouchableOpacity
                onPress={simulateStatusChange}
                className="bg-blue-600 rounded-xl items-center shadow-md"
                style={{
                  paddingVertical: responsiveHeight(2.5),
                }}
              >
                <Text style={{ fontSize: responsiveFontSize(18) }} className="text-white font-bold">
                  Mark as Delivered
                </Text>
              </TouchableOpacity>
            </>
          )}

          {isDelivered && (
            <TouchableOpacity
              onPress={handleBackToHome}
              className="bg-orange-600 rounded-xl items-center shadow-md"
              style={{
                paddingVertical: responsiveHeight(2.5),
              }}
            >
              <Text style={{ fontSize: responsiveFontSize(18) }} className="text-white font-bold">
                Back to Home
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
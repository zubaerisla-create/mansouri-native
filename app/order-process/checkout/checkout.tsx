// app/checkout/checkout.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useCart } from '@/src/context/CartContext';
import { useRouter, useLocalSearchParams } from 'expo-router';

type PickupTime = 'busy' | '15' | '30' | '45' | '60' | '120';
type PaymentMethod = 'apple-pay' | 'card' | 'wallet' | 'cash';
type CarType = 'sedan' | 'suv' | 'truck' | 'van';

interface Car {
  id: string;
  make: string;
  model: string;
  color: string;
  plateNumber: string;
  type: CarType;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { cart, getTotalPrice, clearCart } = useCart();
  const params = useLocalSearchParams();
  
  const [selectedPickupTime, setSelectedPickupTime] = useState<PickupTime>('30');
  const [customTime, setCustomTime] = useState('');
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>('card');
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(150.75); // Example balance

  const [loading, setLoading] = useState(false);
  
  const [cars, setCars] = useState<Car[]>([
    { id: '1', make: 'Toyota', model: 'Camry', color: 'Black', plateNumber: 'ABC 123', type: 'sedan' },
    { id: '2', make: 'Honda', model: 'CR-V', color: 'White', plateNumber: 'XYZ 789', type: 'suv' },
    { id: '3', make: 'Ford', model: 'F-150', color: 'Blue', plateNumber: 'DEF 456', type: 'truck' },
  ]);

  // Handle new car from add-car screen
  useEffect(() => {
    if (params.newCar) {
      try {
        const newCar = JSON.parse(params.newCar as string);
        const carExists = cars.some(car => 
          car.plateNumber === newCar.plateNumber && 
          car.make === newCar.make && 
          car.model === newCar.model
        );
        
        if (!carExists) {
          setCars(prev => [...prev, newCar]);
          setSelectedCar(newCar.id);
          Alert.alert('Success', 'Car has been added successfully!');
        }
      } catch (error) {
        console.error('Error parsing car data:', error);
      }
    }
  }, [params.newCar]);

  // Calculate totals
  const subtotal = getTotalPrice();
  const serviceFee = 5.00;
  const vat = subtotal * 0.05;
  const total = subtotal + serviceFee + vat;
  const remainingAfterWallet = Math.max(0, total - (useWalletBalance ? walletBalance : 0));

  const pickupTimes: { time: PickupTime; label: string }[] = [
    { time: 'busy', label: 'I am already outside' },
    { time: '15', label: '15 min' },
    { time: '30', label: '30 min' },
    { time: '45', label: '45 min' },
    { time: '60', label: '1 hour' },
    { time: '120', label: '2 hour' },
  ];

  const paymentMethods: {
    id: PaymentMethod;
    title: string;
    description: string;
    icon: string;
    iconColor: string;
    backgroundColor: string;
  }[] = [
    {
      id: 'apple-pay',
      title: 'Apple Pay',
      description: 'Fast & Secure',
      icon: 'smartphone',
      iconColor: '#ffffff', 
      backgroundColor:"#050202"
    },
    {
      id: 'card',
      title: 'Credit/Debit Card',
      description: 'Visa, Mastercard, Maestro',
      icon: 'credit-card',
      iconColor: '#ffffff', 
      backgroundColor:"#FF6A00"
    },
    {
      id: 'cash',
      title: 'Cash',
      description: 'Pay when you pickup',
      icon: 'dollar-sign',
      iconColor: '#e7e7e7',
      backgroundColor:"#954633"
    },
  ];

  const validateInputs = () => {
    if (!selectedCar) {
      Alert.alert('Car Required', 'Please select or add a car for curbside pickup');
      return false;
    }

    if (cart.length === 0)  {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return false;
    }

    // Check if payment method is selected
    if (!paymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return false;
    }

    // If wallet is selected but balance is insufficient and remaining amount is not zero,
    // ensure another payment method is selected for the remaining amount
    if (paymentMethod === 'wallet' && walletBalance < total && remainingAfterWallet > 0) {
      Alert.alert('Payment Required', 'Please select an additional payment method for the remaining amount');
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (!validateInputs()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const getPickupTimeDisplay = () => {
        if (selectedPickupTime === 'busy') {
          return 'I am busy right now';
        }
        return customTime ? `${customTime} minutes` : `${selectedPickupTime} minutes`;
      };
      
      const orderId = `ORD-${Date.now()}`;
      
      const orderDetails = {
        orderId,
        pickupTime: getPickupTimeDisplay(),
        car: selectedCar ? cars.find(c => c.id === selectedCar) : null,
        paymentMethod: paymentMethod,
        useWalletBalance,
        walletAmountUsed: useWalletBalance ? Math.min(walletBalance, total) : 0,
        items: cart,
        total: total.toFixed(2),
        remainingToPay: remainingAfterWallet.toFixed(2),
        timestamp: new Date().toISOString(),
      };

      console.log('Order placed:', orderDetails);
      
      // Clear cart first
      clearCart();
      
      // FIXED: Correct navigation to order status page
      router.replace({
        pathname: '/order-process/order-status/[orderId]',
        params: { orderId }
      });
      
    } catch (error) {
      Alert.alert('Error', 'Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  const navigateToAddCar = () => {
    router.push({
      pathname: '/order-process/add-car/add-car',
      params: { fromCheckout: 'true' }
    });
  };

  // Handle wallet toggle change
  const handleWalletToggle = (value: boolean) => {
    setUseWalletBalance(value);
    // When wallet toggle is turned on, auto-select wallet payment method
    if (value) {
      setPaymentMethod('wallet');
    } else {
      // When wallet toggle is turned off, keep the current payment method if it's not wallet
      // If wallet was selected, clear the selection
      if (paymentMethod === 'wallet') {
        setPaymentMethod(null);
      }
    }
  };

  // Handle payment method selection (toggle behavior)
  const handlePaymentMethodSelect = (methodId: PaymentMethod) => {
    // If wallet toggle is on and user selects a non-wallet method,
    // that means they want to pay the remaining amount with that method
    if (useWalletBalance && methodId !== 'wallet') {
      // Set payment method to the selected non-wallet method
      setPaymentMethod(methodId);
    } else if (useWalletBalance && methodId === 'wallet') {
      // If wallet is already selected, toggle it off
      if (paymentMethod === 'wallet') {
        setPaymentMethod(null);
      } else {
        setPaymentMethod('wallet');
      }
    } else {
      // Normal toggle behavior when wallet toggle is off
      if (paymentMethod === methodId) {
        setPaymentMethod(null);
      } else {
        setPaymentMethod(methodId);
      }
    }
  };

  // Determine if a payment method should be shown as selected
  const isPaymentMethodSelected = (methodId: PaymentMethod) => {
    return paymentMethod === methodId;
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900">Check Out</Text>
        </View>
        <Text className="text-gray-600">{cart.length} items</Text>
      </View>

      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Pickup Time Section */}
        <View className="p-5">
          <View className='flex-row items-center gap-2 mb-5'>
            <Feather name="clock" size={20} color="#d64848" />
            <Text className="text-xl font-bold text-gray-900">Pickup Time</Text>
          </View>
          
          <View className="flex-row flex-wrap gap-3 mb-6">
            {pickupTimes.map((time) => (
              <TouchableOpacity
                key={time.time}
                onPress={() => {
                  setSelectedPickupTime(time.time);
                  if (time.time !== 'busy') {
                    setCustomTime('');
                  }
                }}
                className={`px-4 py-3 rounded-lg border-2 ${
                  selectedPickupTime === time.time
                    ? 'bg-orange-50 border-orange-500'
                    : 'border-gray-300 bg-white'
                }`}
              >
                <Text className={`font-medium ${
                  selectedPickupTime === time.time
                    ? 'text-orange-500'
                    : 'text-gray-700'
                }`}>
                  {time.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Time Input */}
          <View className="mb-8">
            <Text className="text-lg font-semibold text-gray-900 mb-3">Custom Time</Text>
            <View className="relative">
              <TextInput
                className={`bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 pr-12 ${
                  selectedPickupTime === 'busy' ? 'opacity-50' : ''
                }`}
                placeholder="e.g. 17"
                placeholderTextColor="#999"
                value={customTime}
                onChangeText={(text) => {
                  setCustomTime(text);
                  if (text) {
                    setSelectedPickupTime('15'); // Reset to a time option when custom time is entered
                  }
                }}
                keyboardType="number-pad"
                editable={selectedPickupTime !== 'busy'}
              />
              {customTime && selectedPickupTime !== 'busy' ? (
                <TouchableOpacity
                  onPress={() => {
                    setCustomTime('');
                  }}
                  className="absolute right-3 top-3"
                >
                  <Feather name="x" size={20} color="#999" />
                </TouchableOpacity>
              ) : (
                <Text className="absolute right-3 top-3 text-gray-500">min</Text>
              )}
            </View>
            {selectedPickupTime === 'busy' && (
              <Text className="text-orange-600 text-sm mt-2">
                Note: You've selected "I am already outside". Custom time is disabled.
              </Text>
            )}
          </View>

          <View className="h-px bg-gray-300 mb-8" />

        </View>

        {/* Car Selection Section - Always Visible */}
        <View className="px-5 mb-8">
          <View className='flex-row items-center justify-between mb-4'>
            <View className='flex-row items-center gap-2'>
              <Feather name="truck" size={20} color="#d64848" />
              <Text className="text-xl font-bold text-gray-900">Select Your Car</Text>
            </View>
          
          </View>
          
          {/* Car List */}
          <View className="mb-6">
            {cars.map((car) => (
              <TouchableOpacity
                key={car.id}
                onPress={() => setSelectedCar(car.id)}
                className={`flex-row items-center p-4 mb-3 rounded-xl border-2 ${
                  selectedCar === car.id
                    ? 'bg-orange-50 border-orange-500'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                  selectedCar === car.id
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-gray-400'
                }`}>
                  {selectedCar === car.id && (
                    <Feather name="check" size={14} color="white" />
                  )}
                </View>
                
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {car.make} {car.model}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {car.color} • {car.plateNumber} • {car.type.toUpperCase()}
                  </Text>
                </View>
                
                <View className="ml-2">
                  <Feather name="chevron-right" size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add New Car Button */}
          <TouchableOpacity
            onPress={navigateToAddCar}
            className="flex-row items-center justify-center py-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
          >
            <Feather name="plus-circle" size={20} color="#3b82f6" />
            <Text className="ml-2 text-blue-500 font-semibold text-lg">Add New Car</Text>
          </TouchableOpacity>
          
          
        </View>

        {/* Payment Method Section */}
        <View className="px-5 mb-8">
          <View className='flex-row items-center gap-2 mb-4'>
            <Feather name="credit-card" size={20} color="#d64848" />
            <Text className="text-xl font-bold text-gray-900">Payment Method</Text>
          </View>
          
          {/* Wallet Toggle */}
          <View className="mt-2">
            <View className={`p-4 rounded-xl border-2 ${
              useWalletBalance 
                ? 'bg-orange-50 border-orange-500' 
                : 'border-gray-100 bg-white'
            }`}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-semibold text-gray-900">Use Wallet Balance</Text>
                  <Text className="text-gray-600 text-sm">
                    Available: {walletBalance.toFixed(2)} SAR
                  </Text>
                </View>
                <Switch
                  value={useWalletBalance}
                  onValueChange={handleWalletToggle}
                  trackColor={{ false: '#d1d5db', true: '#FF5101' }}
                  thumbColor={useWalletBalance ? '#ffffff' : '#f9fafb'}
                />
              </View>
              
              {useWalletBalance && (
                <View className="space-y-2 mt-3">
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Wallet Balance</Text>
                    <Text className="text-green-600 font-medium">
                      -{Math.min(walletBalance, total).toFixed(2)} SAR
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-600">Remaining to Pay</Text>
                    <Text className="text-gray-900 font-bold">
                      {remainingAfterWallet.toFixed(2)} SAR
                    </Text>
                  </View>
                  {walletBalance < total && (
                    <Text className="text-orange-600 text-sm">
                      Note: You'll need to pay the remaining amount using another payment method
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Payment Methods List - Always show all payment options */}
          <View className="space-y-3 mt-6">
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                onPress={() => handlePaymentMethodSelect(method.id)}
                className={`flex-row items-center p-4 rounded-xl border-2 ${
                  isPaymentMethodSelected(method.id)
                    ? 'bg-orange-50 border-orange-500'
                    : 'border-gray-200 bg-white'
                } ${useWalletBalance && method.id === 'wallet' ? 'opacity-100' : ''}`}
              >
                <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
                  isPaymentMethodSelected(method.id)
                    ? 'bg-orange-500 border-orange-500'
                    : 'border-gray-400'
                }`}>
                  {isPaymentMethodSelected(method.id) && (
                    <Feather name="check" size={14} color="white" />
                  )}
                </View>
                
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {method.title}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {method.description}
                  </Text>
                </View>
                
                <View
                  style={{
                    backgroundColor: method.backgroundColor,
                    padding: 10,
                    borderRadius: 12,
                  }}
                >
                  <Feather
                    name={method.icon as any}
                    size={20}
                    color={method.iconColor}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

      
        </View>

        {/* Order Summary */}
        <View className="px-5 mb-8">
          <View className='flex-row items-center gap-2 mb-4'>
            <Feather name="file-text" size={20} color="#d64848" />
            <Text className="text-xl font-bold text-gray-900">Order Summary</Text>
          </View>
          
          <View className="bg-gray-50 rounded-xl p-4">
            {cart.map((item, index) => (
              <View key={`checkout-${item.id}-${index}`} className="flex-row justify-between mb-2">
                <Text className="text-gray-600" numberOfLines={1} style={{ flex: 2 }}>
                  {item.name} {item.quantity > 1 && `×${item.quantity}`}
                  {item.size && ` (${item.size})`}
                </Text>
                <Text className="text-gray-900 font-medium" style={{ flex: 1, textAlign: 'right' }}>
                  {(item.price * item.quantity).toFixed(2)} SAR
                </Text>
              </View>
            ))}
            
            <View className="h-px bg-gray-300 my-3" />
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Subtotal</Text>
                <Text className="text-gray-900">{subtotal.toFixed(2)} SAR</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Service Fee</Text>
                <Text className="text-gray-900">{serviceFee.toFixed(2)} SAR</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">VAT (5%)</Text>
                <Text className="text-gray-900">{vat.toFixed(2)} SAR</Text>
              </View>

              {/* Wallet Balance Deduction - Show if using wallet */}
              {useWalletBalance && (
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Wallet Balance Used</Text>
                  <Text className="text-green-600 font-medium">
                    -{Math.min(walletBalance, total).toFixed(2)} SAR
                  </Text>
                </View>
              )}
              
              <View className="flex-row justify-between mt-4 pt-3 border-t border-gray-300">
                <Text className="text-xl font-bold text-gray-900">Total</Text>
                <Text className="text-xl font-bold text-orange-600">
                  {useWalletBalance ? remainingAfterWallet.toFixed(2) : total.toFixed(2)} SAR
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Payment Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-5">
        <TouchableOpacity
          onPress={processPayment}
          disabled={loading || !selectedCar}
          className={`py-4 rounded-xl items-center shadow-lg ${loading || !selectedCar ? 'bg-orange-400' : 'bg-orange-600'}`}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-xl font-bold">
              Confirm Payment • {useWalletBalance ? remainingAfterWallet.toFixed(2) : total.toFixed(2)} SAR
            </Text>
          )}
        </TouchableOpacity>
        {!selectedCar && (
          <Text className="text-red-500 text-center mt-2">
            Please select a car to proceed
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}
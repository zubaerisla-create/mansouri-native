// app/checkout/checkout.tsx

import CardPaymentForm, { CardData } from '@/src/components/CardPaymentForm';
import { useCart } from '@/src/hooks/useCart';
import { useAppDispatch, useAppSelector } from '@/src/hooks/useRedux';
import api from '@/src/services/api';
import { fetchCars } from '@/src/store/slices/carSlice';
import { Feather } from '@expo/vector-icons';
import { useStripe } from "@stripe/stripe-react-native";
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type PickupTime = 'busy' | '15' | '30' | '45' | '60' | '120';
type PaymentMethod = 'apple-pay' | 'card' | 'wallet' | 'cash' | 'stripe';

export default function CheckoutScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { cart, getTotalPrice, clearCart } = useCart();
  const params = useLocalSearchParams();

  const { cars, isLoading: carsLoading } = useAppSelector(state => state.car);

  const [selectedPickupTime, setSelectedPickupTime] = useState<PickupTime>('30');
  const [customTime, setCustomTime] = useState('');
  const [selectedCar, setSelectedCar] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>('cash');
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(150.75); // Example balance

  const [loading, setLoading] = useState(false);
  const [initiateLoading, setInitiateLoading] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [stripeIntentId, setStripeIntentId] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderNote, setOrderNote] = useState('');

  const { confirmPayment } = useStripe();

  // Fetch cars on mount
  useEffect(() => {
    dispatch(fetchCars());
  }, []);

  // Set default car if available and none selected
  useEffect(() => {
    if (cars.length > 0 && !selectedCar) {
      setSelectedCar(cars[0].id);
    }
  }, [cars]);

  // Initiate checkout to get summary (for non-card methods or when card details are updated)
  useEffect(() => {
    if (params.branch_id && paymentMethod) {
      // If card is selected but we don't have an intent yet, let handlePaymentMethodSelect handle it
      if (paymentMethod === 'card' && !stripeIntentId) return;

      setInitiateLoading(true);

      // Map 'card' UI selection to 'stripe' API payment method
      const apiPaymentMethod = paymentMethod === 'card' ? 'stripe' : paymentMethod;

      const payload: any = {
        branch_id: params.branch_id as string,
        payment_method: apiPaymentMethod,
      };

      // No need to send card details in initiate when confirming on client
      if (apiPaymentMethod === 'stripe' && cardData) {
        // Stripe confirmation is handled separately
      }

      api.initiateCheckout(payload)
        .then((res: any) => {
          if (res.success && res.data?.summary) {
            setSummary(res.data.summary);
            // Store stripe_intent_id if returned for stripe (UI 'card')
            if (apiPaymentMethod === 'stripe' && res.data.stripe_intent_id) {
              setStripeIntentId(res.data.stripe_intent_id);
            }
          }
        })
        .catch((err: any) => {
          console.error('Initiate checkout error:', err);
          if (err.response?.data?.errors?.payment_method) {
            Alert.alert('Payment Error', 'Please check your payment method details');
          }
        })
        .finally(() => setInitiateLoading(false));
    }
  }, [params.branch_id, paymentMethod, cardData]);

  // Calculate totals
  const subtotal = summary ? parseFloat(summary.subtotal) : getTotalPrice();
  const serviceFee = summary ? parseFloat(summary.service_fee) : 5.00;
  const vat = summary ? parseFloat(summary.vat) : subtotal * 0.05;
  const total = summary ? parseFloat(summary.total) : subtotal + serviceFee + vat;
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
        backgroundColor: "#050202"
      },
      {
        id: 'card',
        title: 'Credit/Debit Card',
        description: 'Visa, Mastercard, Stripe',
        icon: 'credit-card',
        iconColor: '#ffffff',
        backgroundColor: "#FF6A00"
      },
      {
        id: 'cash',
        title: 'Cash',
        description: 'Pay when you pickup',
        icon: 'dollar-sign',
        iconColor: '#e7e7e7',
        backgroundColor: "#954633"
      },
    ];

  const validateInputs = () => {
    if (!selectedCar) {
      Alert.alert('Car Required', 'Please select or add a car for curbside pickup');
      return false;
    }

    if (!cart || !cart.items || cart.items.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return false;
    }

    // Check if payment method is selected
    if (!paymentMethod) {
      Alert.alert('Payment Method Required', 'Please select a payment method');
      return false;
    }

    // Check if card details are filled when card payment is selected
    if (paymentMethod === 'card' && !cardData) {
      Alert.alert('Card Required', 'Please add card details to proceed');
      return false;
    }

    if (paymentMethod === 'card' && !stripeIntentId) {
      Alert.alert('Payment Error', 'Failed to initialize Stripe payment. Please try again.');
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
      const getPickupTimeDisplay = () => {
        if (selectedPickupTime === 'busy') {
          return 'busy'; // Adjust based on API expectations if needed
        }
        return customTime ? `${customTime} minutes` : `${selectedPickupTime} minutes`;
      };

      const branchIdToUse = params.branch_id as string;

      if (!branchIdToUse) {
        Alert.alert('Error', 'Branch information is missing. Please go back to the cart.');
        setLoading(false);
        return;
      }

      const apiPaymentMethod = paymentMethod === 'card' ? 'stripe' : paymentMethod;

      // If Stripe payment, we now confirm it inside the CardPaymentForm
      // so we just check if we have the cardData (which now means payment is confirmed)
      if (apiPaymentMethod === 'stripe' && !cardData) {
        Alert.alert('Payment Required', 'Please complete the card payment first.');
        setLoading(false);
        return;
      }

      const response = await api.confirmCheckout({
        branch_id: branchIdToUse,
        payment_method: apiPaymentMethod as string,
        note: orderNote,
        pickup_time: getPickupTimeDisplay(),
        car_id: selectedCar as string,
        stripe_intent_id: apiPaymentMethod === 'stripe' ? (stripeIntentId || undefined) : undefined,
      });

      if (response.success) {
        console.log('Order placed:', response.data);

        // Clear cart first
        clearCart();

        // Navigate to order status page
        router.replace({
          pathname: '/order-process/order-status/[orderId]',
          params: { orderId: response.data.id }
        });
      } else {
        Alert.alert('Error', response.message || 'Failed to place order');
      }

    } catch (error: any) {
      console.error('Payment process error:', error);
      Alert.alert('Error', error.message || 'Failed to process payment. Please try again.');
    } finally {
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
  const handlePaymentMethodSelect = async (methodId: PaymentMethod) => {
    // If selecting card payment, first initiate checkout to get stripe_intent_id
    if (methodId === 'card') {
      if (!params.branch_id) {
        Alert.alert('Error', 'Branch ID is missing');
        return;
      }

      setInitiateLoading(true);
      try {
        const payload = {
          branch_id: params.branch_id as string,
          payment_method: 'stripe', // Use 'stripe' for API
        };

        const res = await api.initiateCheckout(payload);

        if (res.success && res.data?.stripe_intent_id) {
          setStripeIntentId(res.data.stripe_intent_id);
          setClientSecret(res.data.client_secret);
          if (res.data.summary) setSummary(res.data.summary);

          setPaymentMethod('card');
          setShowCardForm(true); // Now show the card form
        } else {
          Alert.alert('Error', res.message || 'Failed to initialize payment');
        }
      } catch (err: any) {
        console.error('Manual initiate error:', err);
        Alert.alert('Error', err.message || 'Failed to initialize card payment');
      } finally {
        setInitiateLoading(false);
      }
      return;
    }

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

  // Handle card payment confirmation from modal
  const handleCardPaymentConfirm = async (data: CardData) => {
    if (!clientSecret) {
      Alert.alert('Error', 'Payment session not initialized. Please try again.');
      return;
    }

    setInitiateLoading(true);
    try {
      console.log('💳 Confirming Stripe payment intent...');
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        console.error('Stripe Error:', error);
        Alert.alert('Payment Failed', error.message);
        return;
      }

      if (paymentIntent?.status === 'Succeeded' || paymentIntent?.status === 'RequiresCapture') {
        setCardData(data);
        setShowCardForm(false);
        Alert.alert('Payment Successful', 'Your payment has been confirmed. Tap "Confirm Order" to complete.');
      } else {
        Alert.alert('Payment Status', `Payment is ${paymentIntent?.status}. Please try again.`);
      }
    } catch (err: any) {
      console.error('Stripe Confirm Error:', err);
      Alert.alert('Error', 'An unexpected error occurred during payment confirmation.');
    } finally {
      setInitiateLoading(false);
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
        <Text className="text-gray-600">{cart?.items?.length || 0} items</Text>
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
                className={`px-4 py-3 rounded-lg border-2 ${selectedPickupTime === time.time
                  ? 'bg-orange-50 border-orange-500'
                  : 'border-gray-300 bg-white'
                  }`}
              >
                <Text className={`font-medium ${selectedPickupTime === time.time
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
                className={`bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-700 pr-12 ${selectedPickupTime === 'busy' ? 'opacity-50' : ''
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
                className={`flex-row items-center p-4 mb-3 rounded-xl border-2 ${selectedCar === car.id
                  ? 'bg-orange-50 border-orange-500'
                  : 'border-gray-200 bg-white'
                  }`}
              >
                <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${selectedCar === car.id
                  ? 'bg-orange-500 border-orange-500'
                  : 'border-gray-400'
                  }`}>
                  {selectedCar === car.id && (
                    <Feather name="check" size={14} color="white" />
                  )}
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-semibold text-gray-900">
                    {car.car_model}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {car.plate_number}
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
            <View className={`p-4 rounded-xl border-2 ${useWalletBalance
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
                className={`flex-row items-center p-4 rounded-xl border-2 ${isPaymentMethodSelected(method.id)
                  ? 'bg-orange-50 border-orange-500'
                  : 'border-gray-200 bg-white'
                  } ${useWalletBalance && method.id === 'wallet' ? 'opacity-100' : ''}`}
              >
                <View className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${isPaymentMethodSelected(method.id)
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

                  {/* Show card details if saved */}
                  {method.id === 'card' && cardData && (
                    <View className="mt-3 pt-3 border-t border-gray-300">
                      <Text className="text-gray-700 text-sm font-medium">
                        Card: •••• {cardData.last4 || '****'}
                      </Text>
                    </View>
                  )}
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

        {/* Order Note Section */}
        <View className="px-5 mb-8">
          <View className='flex-row items-center gap-2 mb-4'>
            <Feather name="edit-3" size={20} color="#d64848" />
            <Text className="text-xl font-bold text-gray-900">Order Note</Text>
          </View>
          <View className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <TextInput
              multiline
              numberOfLines={3}
              placeholder="Add any special instructions (e.g. No onions please)"
              placeholderTextColor="#9CA3AF"
              value={orderNote}
              onChangeText={setOrderNote}
              style={{ textAlignVertical: 'top', height: 80 }}
              className="text-gray-900 text-base"
            />
          </View>
        </View>

        {/* Order Summary */}
        <View className="px-5 mb-8">
          <View className='flex-row items-center gap-2 mb-4'>
            <Feather name="file-text" size={20} color="#d64848" />
            <Text className="text-xl font-bold text-gray-900">Order Summary</Text>
          </View>

          <View className="bg-gray-50 rounded-xl p-4">
            {(summary ? summary.items : (cart?.items || [])).map((item: any, index: number) => (
              <View key={`checkout-${item.id || item.cart_item_id || index}-${index}`} className="flex-row justify-between mb-2">
                <Text className="text-gray-600" numberOfLines={1} style={{ flex: 2 }}>
                  {item.name} {item.quantity > 1 && `×${item.quantity}`}
                  {item.size && ` (${item.size})`}
                </Text>
                <Text className="text-gray-900 font-medium" style={{ flex: 1, textAlign: 'right' }}>
                  {summary ? item.subtotal : (parseFloat(item.item_price || item.price || '0') * item.quantity).toFixed(2)} SAR
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

      {/* Card Payment Form Modal */}
      <CardPaymentForm
        visible={showCardForm}
        onClose={() => setShowCardForm(false)}
        onConfirm={handleCardPaymentConfirm}
      />
    </SafeAreaView>
  );
}
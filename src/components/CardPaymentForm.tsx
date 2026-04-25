import { Feather } from '@expo/vector-icons';
import { CardField, CardFieldInput } from '@stripe/stripe-react-native';
import * as React from 'react';
import { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface CardPaymentFormProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (cardData: CardData) => void;
}

export interface CardData {
  brand?: string;
  complete: boolean;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export default function CardPaymentForm({
  visible,
  onClose,
  onConfirm,
}: CardPaymentFormProps) {
  const [cardDetails, setCardDetails] = useState<CardFieldInput.Details | null>(null);

  const handleConfirm = () => {
    if (cardDetails?.complete) {
      onConfirm({
        brand: cardDetails.brand,
        complete: cardDetails.complete,
        last4: cardDetails.last4,
        expiryMonth: cardDetails.expiryMonth,
        expiryYear: cardDetails.expiryYear,
      });
    } else {
      Alert.alert('Incomplete Card Details', 'Please enter all required card information.');
    }
  };

  const handleClose = () => {
    setCardDetails(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50">
        <View className="flex-1 bg-white rounded-t-3xl mt-auto">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-900">
              Add Card Details
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
              {/* Card Preview */}
              <View className="px-5 py-6">
                <View className="rounded-2xl p-6 mb-6"
                  style={{
                    backgroundColor: '#FF6A00',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 5,
                  }}>
                  <View className="mb-12">
                    <Text className="text-white text-sm font-medium mb-2 opacity-80">
                      Card Details
                    </Text>
                    <Text className="text-white text-lg tracking-widest font-semibold">
                      {cardDetails?.last4 ? `•••• •••• •••• ${cardDetails.last4}` : '•••• •••• •••• ••••'}
                    </Text>
                  </View>

                  <View className="flex-row justify-between items-end">
                    <View>
                      <Text className="text-white text-xs font-medium mb-2 opacity-80">
                        Expiry
                      </Text>
                      <Text className="text-white text-base font-semibold">
                        {cardDetails?.expiryMonth ? `${cardDetails.expiryMonth}/${cardDetails.expiryYear}` : 'MM/YY'}
                      </Text>
                    </View>

                    <View>
                      <Text className="text-white text-xs font-medium mb-2 opacity-80">
                        Brand
                      </Text>
                      <Text className="text-white text-base font-semibold">
                        {cardDetails?.brand || 'Card'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Stripe CardField */}
                <View className="mb-8">
                  <Text className="text-gray-900 font-semibold text-base mb-3">
                    Enter Card Information
                  </Text>
                  <CardField
                    postalCodeEnabled={false}
                    placeholder={{
                      number: 'Card Number',
                    }}
                    cardStyle={{
                      backgroundColor: '#F9FAFB',
                      textColor: '#111827',
                      placeholderColor: '#9CA3AF',
                      borderWidth: 1,
                      borderColor: '#D1D5DB',
                      borderRadius: 8,
                    }}
                    style={{
                      width: '100%',
                      height: 50,
                      marginVertical: 10,
                    }}
                    onCardChange={(details) => {
                      setCardDetails(details);
                    }}
                  />
                </View>

                {/* Security Info */}
                <View className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                  <View className="flex-row items-flex-start gap-2">
                    <Feather name="info" size={16} color="#3B82F6" style={{ marginTop: 2 }} />
                    <Text className="text-blue-700 text-sm flex-1">
                      Your payment information is handled securely by Stripe. We never store your card details.
                    </Text>
                  </View>
                </View>
              </View>
          </ScrollView>

          {/* Confirm Button */}
          <View className="px-5 pb-5 border-t border-gray-200">
            <TouchableOpacity
              onPress={handleConfirm}
              className="bg-orange-600 py-4 rounded-lg items-center mt-4"
              activeOpacity={0.8}
            >
              <Text className="text-white text-lg font-bold">
                Confirm Card Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

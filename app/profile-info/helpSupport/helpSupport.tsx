import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { AppText as Text } from "@/src/components/AppText";
import { useTranslation } from "@/src/hooks/useTranslation";

const HelpSupport = () => {
  const { t, isRTL } = useTranslation();
  const [selectedOrder, setSelectedOrder] = useState('#ORD2623');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const orders = [
    '#ORD2623',
    '#ORD2519',
    '#ORD2471',
    '#ORD2314',
  ];

  const handleSubmit = () => {
    console.log({
      order: selectedOrder,
      name: fullName,
      email,
      description,
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="flex-row pt-12 items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="p-2"
            activeOpacity={0.7}
          >
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color="#000" />
          </TouchableOpacity>
          <Text bold className={`text-xl font-semibold text-gray-900 flex-1 ${isRTL ? 'mr-4 text-right' : 'ml-4 text-left'}`}>
            {t('helpSupportTitle')}
          </Text>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-4 pt-6">
          {/* Title */}
          <Text bold className={`text-2xl font-bold text-gray-900 mb-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('submitTicket')}
          </Text>

          {/* Form Container */}
          <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            {/* Order Picker */}
            <View className="mb-5">
              <Text bold className={`text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('selectRelatedOrder')}
              </Text>
              <View className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={selectedOrder}
                  onValueChange={(itemValue) => setSelectedOrder(itemValue)}
                  className="w-full text-gray-900"
                  style={{ height: 48 }}
                  dropdownIconColor="#666"
                >
                  {orders.map((order) => (
                    <Picker.Item
                      key={order}
                      label={order}
                      value={order}
                      color="#000"
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Full Name */}
            <View className="mb-5">
              <Text bold className={`text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('fullName')}
              </Text>
              <TextInput
                className={`border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-white ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={t('fullNamePlaceholder')}
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            {/* Email */}
            <View className="mb-5">
              <Text bold className={`text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('email')}
              </Text>
              <TextInput
                className={`border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-white ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={t('emailPlaceholder')}
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text bold className={`text-sm font-semibold text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('descriptionTitle')}
              </Text>
              <TextInput
                className={`border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-900 bg-white min-h-[140px] ${isRTL ? 'text-right' : 'text-left'}`}
                placeholder={t('describeIssuePlaceholder')}
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              className="bg-orange-500 rounded-xl py-4 items-center active:bg-orange-600"
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text bold className="text-white text-lg font-semibold">
                {t('sendTicket')}
              </Text>
            </TouchableOpacity>
          </View>

        

  
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupport;
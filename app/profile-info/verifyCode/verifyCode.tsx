// verify-otp.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Keyboard,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { useAppSelector } from '@/src/hooks/useRedux';
import { ActivityIndicator } from 'react-native';

const CELL_COUNT = 6;

export default function verifyCode() {
  const router = useRouter();
  const { phoneNumber, formattedPhoneNumber } = useLocalSearchParams<{ phoneNumber: string, formattedPhoneNumber: string }>();
  const { verifyNewPhone, isLoading } = useAuth();
  const authToken = useAppSelector((state) => state.auth.token);
  
  const [code, setCode] = useState<string[]>(Array(CELL_COUNT).fill(''));
  const [timeLeft, setTimeLeft] = useState(54);
  const inputs = useRef<TextInput[]>([]);

  // Timer for resend
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (text: string, index: number) => {
    if (text.length > 1) text = text.slice(-1);

    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < CELL_COUNT - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (text && index === CELL_COUNT - 1) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isCodeComplete = code.join('').length === CELL_COUNT;

  return (
    <SafeAreaView className="flex-1 bg-white">

      {/* 🔙 Back Button */}
      <View className="px-4 pt-8">
       <TouchableOpacity
  className="w-10 h-10 rounded-full items-center justify-center"
  onPress={() => router.push('/(auth)/phone-number')} // 🔑 direct push kore last page
>
  <Text className="text-1xl text-gray-800">back</Text>
</TouchableOpacity>

      </View>

      {/* Center Content */}
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Verify otp
        </Text>

        <Text className="text-base text-gray-600 mb-10 text-center">
          Code sent to +966565137895
        </Text>

        {/* OTP Inputs */}
        <View className="flex-row justify-between mb-8">
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                if (ref) inputs.current[index] = ref;
              }}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              autoFocus={index === 0}
              selectTextOnFocus
              className={`
                w-12 h-12 rounded-full
                border-2 text-2xl font-semibold
                ${digit
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-300 text-gray-400'
                }
              `}
            />
          ))}
        </View>

        {/* Resend */}
        <TouchableOpacity
          disabled={timeLeft > 0}
          onPress={() => {
            setTimeLeft(60);
            setCode(Array(CELL_COUNT).fill(''));
            inputs.current[0]?.focus();
          }}
          className="items-center"
        >
          <Text className="text-gray-500 text-base">
            {timeLeft > 0
              ? `Resend in ${timeLeft} seconds`
              : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </View>

    <View style={{ paddingHorizontal: 24, paddingBottom: 24 }}>
      <TouchableOpacity
        disabled={!isCodeComplete || isLoading}
        onPress={async () => {
          if (isCodeComplete && authToken) {
            const otp_code = code.join('');
            const success = await verifyNewPhone(phoneNumber, otp_code, authToken);
            if (success) {
              router.push('/(tabs)/More'); 
            }
          }
        }}
        style={{
          paddingVertical: 16,
          borderRadius: 12,
          alignItems: 'center',
          backgroundColor: (isCodeComplete && !isLoading) ? '#F97316' : '#FDBA74',
          opacity: (isCodeComplete && !isLoading) ? 1 : 0.7,
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>
            Continue
          </Text>
        )}
      </TouchableOpacity>
    </View>

    </SafeAreaView>
  );
}

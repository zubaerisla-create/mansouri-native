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
import { useRouter } from 'expo-router';

const CELL_COUNT = 6;

export default function verifyCode() {
  const router = useRouter();
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

      {/* Bottom Continue Button */}
      <View className="px-6 pb-6">
        <TouchableOpacity
          disabled={!isCodeComplete}
          onPress={() => {
            if (isCodeComplete) {
              console.log('OTP Entered:', code.join(''));
              router.push('/(tabs)/More'); // Navigate to home after verification
            }
          }}
          className={`
            py-4 rounded-xl items-center
            ${isCodeComplete ? 'bg-orange-500' : 'bg-orange-300'}
          `}
        >
          <Text className="text-white text-lg font-semibold">
            Continue
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// verify-otp.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Keyboard,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator } from 'react-native';
import { AppText as Text } from "@/src/components/AppText";
import { useAuth } from '@/src/hooks/useAuth';
import { useTranslation } from "@/src/hooks/useTranslation";

const CELL_COUNT = 6;
const { width, height } = Dimensions.get('window');

// Responsive size calculation
const responsiveSize = (size: number) => {
  const scale = width / 375; // Base width (iPhone 13)
  return Math.round(size * Math.min(scale, 1.5)); // Limit scaling
};

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { phoneNumber, formattedPhoneNumber } = useLocalSearchParams<{ phoneNumber: string, formattedPhoneNumber: string }>();
  const { t, isRTL } = useTranslation();
  const { otpLogin, isLoading, error, clearError } = useAuth();
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
    if (error) clearError();

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

  // Responsive calculations
  const containerPadding = responsiveSize(24);
  const inputSize = responsiveSize(50);
  const inputSpacing = (width - (inputSize * CELL_COUNT) - (containerPadding * 2)) / (CELL_COUNT - 1);
  const buttonPaddingBottom = Platform.OS === 'ios' ? responsiveSize(24) : responsiveSize(32);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* 🔙 Back Button - Responsive */}
      <View 
        style={{ paddingHorizontal: containerPadding, paddingTop: responsiveSize(32) }}
        className="pt-8"
      >
   <TouchableOpacity onPress={()=> router.back()} >
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={28} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Center Content */}
      <View 
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          paddingHorizontal: containerPadding,
          marginTop: responsiveSize(-50) // Adjust vertical centering
        }}
      >
        {/* Title */}
        <Text 
          style={{ 
            fontSize: responsiveSize(28),
            marginBottom: responsiveSize(8)
          }}
          className="font-bold text-gray-800 text-center"
        >
          {t('verifyOtp')}
        </Text>

        {/* Subtitle */}
        <Text 
          style={{ 
            fontSize: responsiveSize(14),
            marginBottom: responsiveSize(40)
          }}
          className="text-gray-600 text-center"
        >
          {t('codeSentTo')} {formattedPhoneNumber || phoneNumber || '+96656XXXXXXX'}
        </Text>

        {/* OTP Inputs - Responsive spacing */}
        <View 
          style={{ 
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: responsiveSize(32)
          }}
        >
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
              style={{
                width: inputSize,
                height: inputSize,
                borderRadius: inputSize / 2,
                borderWidth: 2,
                fontSize: responsiveSize(20),
                fontWeight: '600',
                borderColor: digit ? '#F97316' : '#D1D5DB',
                backgroundColor: digit ? '#FFF7ED' : 'transparent',
                color: digit ? '#EA580C' : '#9CA3AF',
              }}
            />
          ))}
        </View>
        
        {/* Error Message Display */}
        {error && (
          <Text 
            style={{ 
              color: '#EF4444', 
              textAlign: 'center', 
              marginBottom: responsiveSize(16),
              fontSize: responsiveSize(14),
              fontWeight: '500'
            }}
          >
            {error}
          </Text>
        )}

        {/* Resend Button */}
        <TouchableOpacity
          disabled={timeLeft > 0}
          onPress={() => {
            setTimeLeft(60);
            setCode(Array(CELL_COUNT).fill(''));
            inputs.current[0]?.focus();
          }}
          className="items-center"
        >
          <Text 
            style={{ fontSize: responsiveSize(14) }}
            className={`text-gray-500 ${timeLeft > 0 ? 'opacity-70' : ''}`}
          >
            {timeLeft > 0
              ? `${t('resendIn')}${timeLeft}${t('seconds')}`
              : t('resendCode')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Continue Button - Responsive */}
      <View 
        style={{ 
          paddingHorizontal: containerPadding,
          paddingBottom: buttonPaddingBottom
        }}
      >
        <TouchableOpacity
          disabled={!isCodeComplete || isLoading}
          onPress={async () => {
            if (isCodeComplete) {
              const otp_code = code.join('');
              const success = await otpLogin(phoneNumber, otp_code, { showAlert: false });
              if (success) {
                router.push('/home');
              }
            }
          }}
          style={{
            paddingVertical: responsiveSize(16),
            borderRadius: responsiveSize(12),
            opacity: (isCodeComplete && !isLoading) ? 1 : 0.7,
          }}
          className={`items-center ${isCodeComplete && !isLoading ? 'bg-orange-500' : 'bg-orange-300'}`}
        >
          {isLoading ? (
            <ActivityIndicator color="#white" />
          ) : (
            <Text 
              style={{ fontSize: responsiveSize(16) }}
              className="text-white font-semibold"
            >
              {t('continue')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
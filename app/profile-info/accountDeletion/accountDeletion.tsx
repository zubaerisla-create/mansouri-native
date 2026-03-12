import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '@/src/hooks/useTranslation';
import { AppText as Text } from '@/src/components/AppText';

const AccountDeletion = () => {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(54);
  const [canResend, setCanResend] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();
  const { t, isRTL } = useTranslation();

  // OTP input refs with proper typing
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (text: string, index: number) => {
    if (text.length > 1) {
      // Handle paste or auto-fill: extract only digits and fill accordingly
      const digits = text.replace(/\D/g, '').split('');
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        if (index + i < 5) {
          newOtp[index + i] = digit;
        }
      });
      
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + digits.length, 4);
      if (nextIndex < 5) {
        inputRefs.current[nextIndex]?.focus();
      } else {
        // If all filled, blur the last input
        inputRefs.current[4]?.blur();
      }
      return;
    }
    
    // Single digit input
    if (/^\d*$/.test(text)) {
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto focus next input
      if (text !== '' && index < 4) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      // Move focus to previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = () => {
    if (canResend) {
      setResendTimer(54);
      setCanResend(false);
      // Here you would normally call your resend OTP API
    }
  };

  const handleDelete = () => {
    console.log('OTP entered:', otp.join(''));
    setShowConfirmation(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmation(false);
    // Add any account deletion API call here before navigation
    router.push("/(auth)/phone-number");
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-10">
          {/* Header */}
          <Link href="/More" asChild>
            <TouchableOpacity className={`mb-5 ${isRTL ? 'items-end' : 'items-start'}`}>
              <Text bold className="text-3xl font-bold text-gray-800">
                {isRTL ? '→' : '←'}
              </Text>
            </TouchableOpacity>
          </Link>

          <Text bold className={`text-2xl font-bold text-gray-900 mb-5 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('deleteAccount')}
          </Text>

          {/* Warning */}
          <Text className={`text-base text-red-700 leading-6 mb-10 ${isRTL ? 'text-right' : 'text-left'}`}>
            {t('accountDelWarning')}
          </Text>

          {/* OTP Inputs */}
          <View className={`flex-row justify-between mb-5 px-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                className="w-14 h-16 border-2 border-gray-300 rounded-xl text-2xl font-bold text-center bg-gray-50"
                value={digit}
                onChangeText={(text) => handleOtpChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={6} // Allow paste of longer OTPs
                autoFocus={index === 0}
                textAlign="center"
                selectionColor="#d32f2f"
                contextMenuHidden={true}
                selectTextOnFocus={true}
              />
            ))}
          </View>

          {/* Resend Timer */}
          <View className="items-center mb-5">
            <Text className="text-sm text-gray-600 mb-1">
              {t('resendIn')} {resendTimer} {t('seconds')}
            </Text>
            {canResend && (
              <TouchableOpacity onPress={handleResend}>
                <Text bold className="text-red-700 font-semibold">{t('resendOtp')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Instruction */}
          <Text className={`text-base text-gray-700 mb-10 text-center`}>
            • {t('deleteOtpInstruct')}
          </Text>

          {/* Delete Button */}
          <TouchableOpacity
            className={`h-14 rounded-xl justify-center items-center mt-auto mb-10 ${
              isOtpComplete ? 'bg-red-700' : 'bg-red-200'
            }`}
            disabled={!isOtpComplete}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Text bold className="text-white text-lg font-bold">{t('delete')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelDelete}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-5">
          <View className="bg-white rounded-2xl p-6 w-full max-w-[340px]">
            <Text bold className="text-xl font-bold text-gray-900 mb-3 text-center">
              {t('confirmDeletion')}
            </Text>
            <Text className="text-base text-gray-700 leading-6 mb-6 text-center">
              {t('confirmDelWarning')}
            </Text>
            <View className={`flex-row justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-lg bg-gray-100 border border-gray-300 items-center mx-1.5"
                onPress={handleCancelDelete}
                activeOpacity={0.7}
              >
                <Text bold className="text-gray-800 font-semibold text-base">
                  {t('noCancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3.5 rounded-lg bg-red-700 items-center mx-1.5"
                onPress={handleConfirmDelete}
                activeOpacity={0.7}
              >
                <Text bold className="text-white font-semibold text-base">
                  {t('yesDelete')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AccountDeletion;
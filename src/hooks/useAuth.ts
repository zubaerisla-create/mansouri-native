import { useState } from 'react';
import { useAppDispatch, useAppSelector } from './useRedux';

import { Alert } from 'react-native';
import { getProfile, logoutUser, otpLogin, sendOTP, updateProfile } from '../features/auth/authSlice';
import { useRouter } from 'expo-router';
import { changePhoneRequest, verifyNewPhone } from '../store/slices/customerSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (phone: string, purpose: 'login' | 'register' = 'login') => {
    setLoading(true);
    const result = await dispatch(sendOTP({ phone, purpose }));
    setLoading(false);

    if (sendOTP.fulfilled.match(result)) {
      Alert.alert('Success', 'OTP sent successfully');
      return true;
    } else {
      Alert.alert('Error', result.payload as string);
      return false;
    }
  };

  const handleOTPLogin = async (phone: string, otp_code: string) => {
    setLoading(true);
    const result = await dispatch(otpLogin({ phone, otp_code }));
    setLoading(false);

    if (otpLogin.fulfilled.match(result)) {
      Alert.alert('Success', 'Login successful');
      return true;
    } else {
      Alert.alert('Error', result.payload as string);
      return false;
    }
  };

  const handleUpdateProfile = async (data: { full_name?: string; username?: string; email?: string }) => {
    setLoading(true);
    const result = await dispatch(updateProfile(data)); 
    setLoading(false);

    if (updateProfile.fulfilled.match(result)) {
      Alert.alert('Success', 'Profile updated successfully');
      return true;
    } else {
      Alert.alert('Error', result.payload as string);
      return false;
    }
  };

  const handleChangePhone = async (phone: string) => {
    setLoading(true);
    const result = await dispatch(changePhoneRequest({ phone }));
    setLoading(false);

    if (changePhoneRequest.fulfilled.match(result)) {
      return true; // Just return true as user specified token comes from auth header
    } else {
      Alert.alert('Error', result.payload as string);
      return false;
    }
  };

  const handleVerifyNewPhone = async (new_phone: string, otp_code: string, token: string) => {
    setLoading(true);
    const result = await dispatch(verifyNewPhone({ new_phone, otp_code, phone_verification_token: token }));
    setLoading(false);

    if (verifyNewPhone.fulfilled.match(result)) {
      Alert.alert('Success', 'Phone number updated successfully');
      return true;
    } else {
      Alert.alert('Error', result.payload as string);
      return false;
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await dispatch(logoutUser());
    setLoading(false);
    // Navigate to the logout-login screen
    router.replace('/(auth)/logout-login');
  };

  const handleGetProfile = async () => {
    await dispatch(getProfile());
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || loading,
    error,
    sendOTP: handleSendOTP,
    otpLogin: handleOTPLogin,
    updateProfile: handleUpdateProfile,
    changePhone: handleChangePhone,
    verifyNewPhone: handleVerifyNewPhone,
    logout: handleLogout,
    getProfile: handleGetProfile,
  };
};
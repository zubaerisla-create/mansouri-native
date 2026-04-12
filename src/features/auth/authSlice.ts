import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import ApiService from '../../services/api';
import { AuthState, User, OTPLoginRequest, SendOTPRequest } from '../../types';

const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async Thunks
export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async ({ phone, purpose }: SendOTPRequest, { rejectWithValue }) => {
    try {
      const response = await ApiService.sendOTP(phone, purpose);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const otpLogin = createAsyncThunk(
  'auth/otpLogin',
  async ({ phone, otp_code }: OTPLoginRequest, { rejectWithValue }) => {
    try {
      const apiResult = await ApiService.otpLogin(phone, otp_code);
      const innerData = apiResult.data;
      const token = innerData.tokens.access;
      Alert.alert('DEBUG', `Token Received: ${token.substring(0, 20)}...`);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(innerData.user));
      ApiService.setToken(token);
      return innerData;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: { full_name?: string; username?: string; email?: string }, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateProfile(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await ApiService.logout();
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      ApiService.setToken(null);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { dispatch }) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      
      if (token) {
        ApiService.setToken(token);
        
        try {
          // Verify token by fetching profile
          const profileResponse = await ApiService.getProfile();
          const user = profileResponse.data || JSON.parse(userStr || '{}');
          dispatch(setAuthenticated({ token, user }));
          console.log('HYDRATION SUCCESS: Token validated');
        } catch (error) {
          console.warn('HYDRATION FAILURE: Token invalid or expired, clearing...', error);
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          ApiService.setToken(null);
        }
      }
    } catch (error) {
      console.error('Failed to load auth from storage', error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticated: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // OTP Login
      .addCase(otpLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(otpLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.tokens.access;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(otpLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = { ...state.user, ...action.payload.data };
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError, setAuthenticated } = authSlice.actions;
export default authSlice.reducer;
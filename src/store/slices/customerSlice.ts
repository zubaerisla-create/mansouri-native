import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ApiService from '../../services/api';
import { ChangePhoneRequest, VerifyNewPhoneRequest } from '../../types';

interface CustomerState {
  phoneChangeToken: string | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CustomerState = {
  phoneChangeToken: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

// Async Thunks
export const changePhoneRequest = createAsyncThunk(
  'customer/changePhoneRequest',
  async ({ phone }: ChangePhoneRequest, { rejectWithValue }) => {
    try {
      const response = await ApiService.changePhoneRequest(phone);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change phone');
    }
  }
);

export const verifyNewPhone = createAsyncThunk(
  'customer/verifyNewPhone',
  async (data: VerifyNewPhoneRequest, { rejectWithValue }) => {
    try {
      const response = await ApiService.verifyNewPhone(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify new phone');
    }
  }
);

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    clearCustomerError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    setPhoneChangeToken: (state, action: PayloadAction<string>) => {
      state.phoneChangeToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Change Phone Request
      .addCase(changePhoneRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(changePhoneRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.phoneChangeToken = action.payload.phone_verification_token;
        state.successMessage = 'OTP sent to new phone number';
        state.error = null;
      })
      .addCase(changePhoneRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify New Phone
      .addCase(verifyNewPhone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyNewPhone.fulfilled, (state) => {
        state.isLoading = false;
        state.phoneChangeToken = null;
        state.successMessage = 'Phone number updated successfully';
        state.error = null;
      })
      .addCase(verifyNewPhone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCustomerError, clearSuccessMessage, setPhoneChangeToken } = customerSlice.actions;
export default customerSlice.reducer;
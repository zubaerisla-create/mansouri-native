import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import ApiService from '../../services/api';
import { Car, AddCarPayload, CarState } from '../../types';

const initialState: CarState = {
  cars: [],
  isLoading: false,
  error: null,
};

export const fetchCars = createAsyncThunk(
  'car/fetchCars',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getCars();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch cars');
    }
  }
);

export const addCar = createAsyncThunk(
  'car/addCar',
  async (payload: AddCarPayload, { rejectWithValue }) => {
    try {
      const response = await ApiService.addCar(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add car');
    }
  }
);

export const updateCar = createAsyncThunk(
  'car/updateCar',
  async ({ id, payload }: { id: string; payload: Partial<AddCarPayload> }, { rejectWithValue }) => {
    try {
      const response = await ApiService.updateCar(id, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update car');
    }
  }
);

export const deleteCar = createAsyncThunk(
  'car/deleteCar',
  async (id: string, { rejectWithValue }) => {
    try {
      await ApiService.deleteCar(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete car');
    }
  }
);

const carSlice = createSlice({
  name: 'car',
  initialState,
  reducers: {
    clearCarError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Cars
      .addCase(fetchCars.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCars.fulfilled, (state, action: PayloadAction<Car[]>) => {
        state.isLoading = false;
        state.cars = action.payload;
        state.error = null;
      })
      .addCase(fetchCars.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add Car
      .addCase(addCar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addCar.fulfilled, (state, action: PayloadAction<Car>) => {
        state.isLoading = false;
        state.cars.push(action.payload);
        state.error = null;
      })
      .addCase(addCar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Car
      .addCase(updateCar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCar.fulfilled, (state, action: PayloadAction<Car>) => {
        state.isLoading = false;
        const index = state.cars.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.cars[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Delete Car
      .addCase(deleteCar.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteCar.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.cars = state.cars.filter((c) => c.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCar.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCarError } = carSlice.actions;
export default carSlice.reducer;

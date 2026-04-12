import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/authSlice';
import customerReducer from './customerSlice';
import cartReducer from './cartSlice';
import carReducer from './carSlice';


const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  cart: cartReducer,
  car: carReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
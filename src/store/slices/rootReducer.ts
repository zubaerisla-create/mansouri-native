import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/authSlice';
import customerReducer from './customerSlice';
import cartReducer from './cartSlice';


const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
  cart: cartReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
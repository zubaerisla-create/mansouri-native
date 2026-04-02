import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../../features/auth/authSlice';
import customerReducer from './customerSlice';


const rootReducer = combineReducers({
  auth: authReducer,
  customer: customerReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
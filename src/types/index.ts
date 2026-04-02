export interface User {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface SendOTPRequest {
  phone: string;
  purpose: 'login' | 'register';
}

export interface OTPLoginRequest {
  phone: string;
  otp_code: string;
}

export interface ChangePhoneRequest {
  phone: string;
}

export interface VerifyNewPhoneRequest {
  new_phone: string;
  otp_code: string;
  phone_verification_token: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  username?: string;
  email?: string;
}

export interface ApiResponse<T = any> {
  status: string;
  message: string;
  data: T;
  token?: string;
  user?: User;
}
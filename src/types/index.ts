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

// --- Menu Types ---

export interface MenuResponse {
  success: boolean;
  message: string;
  data: Category[];
  errors: any;
  meta: {
    branch_name: string;
    count: number;
    timestamp: string;
  };
}

export interface Category {
  category_id: string;
  category_name: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: string; // string, need to parse to number
  description: string;
  calories: number;
  dietary_info: string[];
  modifier_groups: ModifierGroup[];
  image?: string; // Optional image field
}

export interface ModifierGroup {
  id: string;
  name: string;
  type: "optional" | "required";
  min_select: number;
  max_select: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  price: string;
  option_type: string;
}

// --- Cart Types ---

export interface AddToCartPayload {
  branch_id: string;
  menu_item_id: string;
  quantity: number;
  selected_options: string[]; // option IDs only
}

export interface CartResponse {
  success: boolean;
  message: string;
  data: Cart | Cart[];
  errors: any;
  meta: {
    timestamp: string;
  };
}

export interface Cart {
  cart_id: string;
  branch_id: string;
  branch_name: string;
  restaurant_name: string;
  items: CartItem[];
  total: string;
}

export interface CartItem {
  cart_item_id: string;
  menu_item_id: string;
  name: string;
  quantity: number;
  item_price: string;
  options_price: string;
  subtotal: string;
  selected_options: SelectedOption[];
  image?: string; // For UI convenience
}

export interface SelectedOption {
  id: string;
  group_name: string;
  name: string;
  price: string;
}

export interface UpdateCartPayload {
  quantity: number;
}

// --- Car Types ---

export interface Car {
  id: string;
  car_model: string;
  plate_number: string;
  car_color: string;
}

export interface AddCarPayload {
  car_model: string;
  plate_number: string;
  car_color: string;
}

export interface CarResponse {
  success: boolean;
  message: string;
  data: Car;
  errors: any;
  meta: {
    timestamp: string;
  };
}

export interface CarListResponse {
  success: boolean;
  message: string;
  data: Car[];
  errors: any;
  meta: {
    count: number;
    timestamp: string;
  };
}

export interface CarState {
  cars: Car[];
  isLoading: boolean;
  error: string | null;
}
import axios, { AxiosInstance } from 'axios';
import {
  AddCarPayload,
  AddToCartPayload,
  CarListResponse,
  CarResponse,
  CartResponse,
  MenuResponse,
  UpdateCartPayload
} from '../types';

export class ApiError extends Error {
  constructor(
    public status: number | undefined,
    public message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private api: AxiosInstance;
  private localUrl: string;

  constructor() {
    this.localUrl = 'http://10.10.13.22:8070'; // Replace with your actual URL
    this.api = axios.create({
      baseURL: this.localUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    this.setupInterceptors();
  }

  setToken(token: string | null) {
    if (token) {
      // Use both assignment styles for certainty
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Token set in API interceptors:', `Bearer ${token.substring(0, 20)}...`);
    } else {
      delete this.api.defaults.headers.common['Authorization'];
      console.log('🔑 Token removed from API interceptors');
    }
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config: any) => {
        // ngrok header should be included in every request
        if (config.headers?.set) {
          config.headers.set('ngrok-skip-browser-warning', 'true');
        } else {
          config.headers = config.headers || {};
          config.headers['ngrok-skip-browser-warning'] = 'true';
        }

        // If _skipAuth is true, we remove the Authorization header for this request
        if (config._skipAuth) {
          if (config.headers?.delete) {
            config.headers.delete('Authorization');
            config.headers.delete('authorization');
          }
          if (config.headers) {
            delete config.headers['Authorization'];
            delete config.headers['authorization'];
            delete config.headers.Authorization;
          }
        }

        console.log('API DEBUG:', config.method?.toUpperCase(), config.url);
        // Extract Authorization header to console log it
        let authHeader = 'NONE';
        if (config.headers) {
          if (typeof config.headers.get === 'function') {
            authHeader = config.headers.get('Authorization') as string || 'NONE';
          } else {
            authHeader = (config.headers['Authorization'] || config.headers.Authorization || 'NONE') as string;
          }
        }
        console.log('🛡️  AUTH HEADER for request:', authHeader);

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log('API RESPONSE:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('API ERROR:', {
          url: error.config?.url,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });

        if (error.response?.status === 401) {
          console.warn('Unauthorized request detected. Token might be invalid.');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async sendOTP(phone: string, purpose: string = 'login') {
    const response = await this.api.post('/api/v1/customer/auth/otp/send/', {
      phone,
      purpose,
    }, {
      _skipAuth: true
    } as any);
    return response.data;
  }

  async otpLogin(phone: string, otp_code: string) {
    const response = await this.api.post('/api/v1/customer/auth/login/', {
      phone,
      otp_code,
    }, {
      _skipAuth: true
    } as any);
    return response.data;
  }

  async employeeLogin(data: { username: string; password?: string }) {
    const response = await this.api.post('/api/v1/employee/auth/login/', data, {
      _skipAuth: true
    } as any);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/api/v1/customer/profile/');
    return response.data;
  }

  async updateProfile(data: { full_name?: string; username?: string; email?: string }) {
    const response = await this.api.patch('/api/v1/customer/profile/', data);
    return response.data;
  }

  async changePhoneRequest(phone: string) {
    const response = await this.api.post('/api/v1/customer/auth/change-phone/request/', {
      phone,
    });
    return response.data;
  }

  async verifyNewPhone(data: { new_phone: string; otp_code: string; phone_verification_token: string }) {
    const response = await this.api.post('/api/v1/customer/auth/change-phone/verify/', data);
    return response.data;
  }

  async logout() {
    const response = await this.api.post('/api/v1/auth/logout/', {
      phone: '',
      password: '',
    });
    return response.data;
  }

  // Restaurant APIs
  async searchRestaurants(query: string = '') {
    const response = await this.api.get('/api/v1/restaurants/search/', {
      params: {
        q: query,
        user_lat: 23.7218,
        user_lon: 90.4993
      },
      _skipAuth: true
    } as any);
    return response.data;
  }

  async getRestaurant(id: string) {
    // Since there's no direct restaurant endpoint, we fetch search and find the restaurant
    const response = await this.searchRestaurants();
    const restaurants = response?.data || [];
    return restaurants.find((r: any) => r.id?.toString() === id || r.uuid === id) || null;
  }


  // --- New Menu & Cart APIs ---

  async getRestaurantMenu(branchId: string): Promise<MenuResponse> {
    try {
      if (!branchId || branchId.trim() === '') {
        throw new ApiError(400, 'Branch ID is required');
      }

      const response = await this.api.get(`/api/v1/menu/branches/${branchId}/items/`);

      // Transform flat items array into grouped categories
      const items = response.data.data || [];
      const categoriesMap = new Map<string, any>();

      items.forEach((item: any) => {
        const catId = item.category_id;
        const catName = item.category_name;

        if (!categoriesMap.has(catId)) {
          categoriesMap.set(catId, {
            category_id: catId,
            category_name: catName,
            items: []
          });
        }

        // Map API response to MenuItem format
        const menuItem = {
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          calories: item.calories,
          dietary_info: item.dietary_info || [],
          modifier_groups: item.modifier_groups || [],
          image: item.photo || item.image, // Use photo from API or fallback to image
          is_available: item.is_available,
          extra_prep_time: item.extra_prep_time,
          sort_order: item.sort_order
        };

        categoriesMap.get(catId).items.push(menuItem);
      });

      // Convert to array and maintain order
      const categories = Array.from(categoriesMap.values());

      return {
        success: response.data.success,
        message: response.data.message,
        data: categories,
        errors: response.data.errors,
        meta: {
          branch_name: response.data.meta?.branch_name || '',
          count: response.data.meta?.count || items.length,
          timestamp: response.data.meta?.timestamp || new Date().toISOString()
        }
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      const status = error.response?.status;
      let message = 'Failed to fetch menu';

      if (status === 404) {
        message = 'Restaurant menu not found. The restaurant may not be available or the menu data is missing.';
      } else if (status === 401 || status === 403) {
        message = 'Unauthorized. Please log in to continue.';
      } else if (status === 500 || status === 502 || status === 503) {
        message = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        message = 'Network error. Please check your internet connection.';
      }

      throw new ApiError(status, message, error);
    }
  }

  async getRestaurantItem(branchId: string, itemId: string): Promise<any> {
    try {
      if (!branchId || branchId.trim() === '') {
        throw new ApiError(400, 'Branch ID is required');
      }
      if (!itemId || itemId.trim() === '') {
        throw new ApiError(400, 'Item ID is required');
      }

      const response = await this.api.get(`/api/v1/menu/branches/${branchId}/items/${itemId}/`);

      if (!response.data || response.data.success === false) {
        throw new ApiError(
          response.status || 400,
          response.data?.message || 'Failed to fetch item details from server'
        );
      }

      const item = response.data.data || response.data;
      if (!item || (typeof item === 'object' && Object.keys(item).length === 0)) {
        throw new ApiError(404, 'Item details not found in response');
      }

      return {
        ...item,
        image: item.photo || item.image || item.photo_url || item.image_url // Normalize image field
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }

      const status = error.response?.status;
      const apiMessage = error.response?.data?.message;
      let message = apiMessage || 'Failed to fetch item details';

      if (status === 404) {
        message = 'Item not found.';
      } else if (status === 401 || status === 403) {
        message = 'Unauthorized. Please log in to continue.';
      } else if (status === 500 || status === 502 || status === 503) {
        message = 'Server error. Please try again later.';
      }

      console.error(`getRestaurantItem Error [${status}]:`, message, error.config?.url);
      throw new ApiError(status, message, error);
    }
  }

  async getCart(): Promise<CartResponse> {
    const response = await this.api.get('/api/v1/cart/');
    return response.data;
  }

  async addToCart(payload: AddToCartPayload): Promise<CartResponse> {
    const response = await this.api.post('/api/v1/cart/', payload);
    return response.data;
  }

  async updateCartItem(cartItemId: string, payload: UpdateCartPayload): Promise<CartResponse> {
    const response = await this.api.patch(`/api/v1/cart/items/${cartItemId}/`, payload);
    return response.data;
  }

  async deleteCartItem(cartItemId: string): Promise<CartResponse> {
    const response = await this.api.post(`/api/v1/cart/items/${cartItemId}/`);
    return response.data;
  }

  // --- Car Management APIs ---

  async getCars(): Promise<CarListResponse> {
    const response = await this.api.get('/api/v1/user/cars/');
    return response.data;
  }

  async addCar(payload: AddCarPayload): Promise<CarResponse> {
    const response = await this.api.post('/api/v1/user/cars/', payload);
    return response.data;
  }

  async updateCar(id: string, payload: Partial<AddCarPayload>): Promise<CarResponse> {
    const response = await this.api.patch(`/api/v1/user/cars/${id}/`, payload);
    return response.data;
  }

  async deleteCar(id: string): Promise<CarResponse> {
    const response = await this.api.delete(`/api/v1/user/cars/${id}/`);
    return response.data;
  }

  // --- Checkout APIs ---

  async initiateCheckout(payload: {
    branch_id: string;
    payment_method: string;
    card_details?: {
      number: string;
      expiry: string;
      cvv: string;
    };
  }) {
    try {
      // Validate payment_method is a string
      if (typeof payload.payment_method !== 'string') {
        throw new ApiError(400, 'payment_method must be a string');
      }

      const response = await this.api.post('/api/v1/checkout/initiate/', payload);
      console.log('✅ initiateCheckout Response:', JSON.stringify(response.data, null, 2));

      if (!response.data || response.data.success === false) {
        throw new ApiError(
          response.status || 400,
          response.data?.message || 'Failed to initiate checkout'
        );
      }

      return response.data;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;

      const status = error.response?.status;
      const apiMessage = error.response?.data?.message;
      let message = apiMessage || 'Failed to initiate checkout';

      if (status === 402) {
        message = 'Payment initialization failed. Please check your card details.';
      }

      console.error(`initiateCheckout Error [${status}]:`, message, error.config?.url);
      throw new ApiError(status, message, error);
    }
  }

  async confirmCheckout(payload: {
    branch_id: string;
    payment_method: string;
    note: string;
    pickup_time: string;
    car_id: string;
    card_details?: {
      number: string;
      expiry: string;
      cvv: string;
    };
    stripe_intent_id?: string;
  }) {
    try {
      // Validate all required fields
      if (!payload.branch_id || !payload.payment_method || !payload.car_id) {
        throw new ApiError(400, 'branch_id, payment_method, and car_id are required');
      }

      if (typeof payload.payment_method !== 'string') {
        throw new ApiError(400, 'payment_method must be a string');
      }

      console.log('🚀 confirmCheckout Payload (Original):', JSON.stringify(payload, null, 2));

      // Prepare final payload with transformed card details if needed
      const finalPayload: any = { ...payload };

      if (payload.card_details && payload.card_details.expiry) {
        const [month, year] = payload.card_details.expiry.split('/');
        finalPayload.card_details = {
          ...payload.card_details,
          number: payload.card_details.number,
          exp_month: parseInt(month, 10),
          exp_year: parseInt(year, 10),
          cvc: payload.card_details.cvv, // Stripe often expects 'cvc'
          expiry: payload.card_details.expiry // Keep original too just in case
        };
      }

      console.log('🚀 confirmCheckout Final Payload:', JSON.stringify(finalPayload, null, 2));
      const response = await this.api.post('/api/v1/checkout/confirm/', finalPayload);

      if (!response.data || response.data.success === false) {
        throw new ApiError(
          response.status || 400,
          response.data?.message || 'Failed to confirm order'
        );
      }

      return response.data;
    } catch (error: any) {
      if (error instanceof ApiError) throw error;

      const status = error.response?.status;
      const apiMessage = error.response?.data?.message;
      let message = apiMessage || 'Failed to confirm order';

      if (status === 402) {
        message = 'Payment failed. Please check your card or use a different method.';
      }

      console.error(`confirmCheckout Error [${status}]:`, message, error.config?.url);
      throw new ApiError(status, message, error);
    }
  }

  // --- Order APIs ---

  async getOrders(): Promise<any> {
    const response = await this.api.get('/api/v1/orders/');
    return response.data;
  }
}

export default new ApiService();
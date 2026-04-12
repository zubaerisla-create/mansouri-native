import axios, { AxiosInstance } from 'axios';
import { 
  AddToCartPayload, 
  CartResponse, 
  MenuResponse, 
  UpdateCartPayload,
  Car,
  AddCarPayload,
  CarResponse,
  CarListResponse
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private localUrl: string;

  constructor() {
    this.localUrl = 'https://austin-ovisaclike-nonoptically.ngrok-free.dev'; // Replace with your actual URL
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
    } else {
      delete this.api.defaults.headers.common['Authorization'];
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
        const authHeader = config.headers?.get ? config.headers.get('Authorization') : (config.headers?.Authorization || config.headers?.['Authorization']);
        console.log('AUTH HEADER:', authHeader || 'NONE');

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

  async getRestaurantItem(itemId: string) {
    // Items are handled locally after getting the restaurant
    throw new Error('Individual item fetching is not supported on this endpoint configuration.');
  }

  // --- New Menu & Cart APIs ---

  async getRestaurantMenu(branchId: string): Promise<MenuResponse> {
    const response = await this.api.get(`/api/v1/branch/${branchId}/menu/`);
    return response.data;
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
}

export default new ApiService();
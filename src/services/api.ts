import axios, { AxiosInstance } from 'axios';

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

        console.log('API DEBUG:', config.method?.toUpperCase(), config.url);
        console.log('AUTH HEADER:', config.headers.Authorization || config.headers['Authorization'] || 'NONE');

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async sendOTP(phone: string, purpose: string = 'login') {
    const response = await this.api.post('/api/v1/customer/auth/otp/send/', {
      phone,
      purpose,
    });
    return response.data;
  }

  async otpLogin(phone: string, otp_code: string) {
    const response = await this.api.post('/api/v1/customer/auth/login/', {
      phone,
      otp_code,
    });
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
      }
    });
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
}

export default new ApiService();
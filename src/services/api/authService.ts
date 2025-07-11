import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from './auth';

export interface LoginRequest {
  email: string;
  mat_khau: string;
}

export interface LoginResponse {
  token: string;
  user: {
    email: string;
    ho_ten: string;
    id: string;
    vai_tro: string;
  };
}

export interface AuthError {
  error: string;
}

// Constants for AsyncStorage keys
const STORAGE_KEYS = {
  TOKEN: 'accessToken', 
  USER: 'userData',
  REMEMBER_ME: 'rememberMe',
} as const;

class AuthService {
  // Login API call
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await auth.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Email hoặc mật khẩu không đúng');
      } else if (error.response?.status === 500) {
        throw new Error('Không thể tạo token');
      } else {
        throw new Error('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    }
  }

  // Save token and user data to AsyncStorage
  async saveAuthData(token: string, user: any, rememberMe: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, rememberMe.toString());
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw new Error('Không thể lưu thông tin đăng nhập');
    }
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Get stored user data
  async getUser(): Promise<any | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Check if user should be remembered
  async getRememberMe(): Promise<boolean> {
    try {
      const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      return rememberMe === 'true';
    } catch (error) {
      console.error('Error getting remember me:', error);
      return false;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();
      
      if (!token) return false;
      
      // Check if token is expired
      const isExpired = this.isTokenExpired(token);
      if (isExpired) {
        const rememberMe = await this.getRememberMe();
        if (!rememberMe) {
          await this.logout();
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  }

  // Logout - clear all stored data
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.TOKEN,
        STORAGE_KEYS.USER,
        STORAGE_KEYS.REMEMBER_ME,
      ]);
    } catch (error) {
      console.error('Error during logout:', error);
      throw new Error('Không thể đăng xuất');
    }
  }

  // Set authorization header for API requests
  setAuthHeader(token: string): void {
    auth.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Remove authorization header
  removeAuthHeader(): void {
    delete auth.defaults.headers.common['Authorization'];
  }

  // Auto-login setup
  async setupAutoLogin(): Promise<void> {
    try {
      const token = await this.getToken();
      if (token && !this.isTokenExpired(token)) {
        this.setAuthHeader(token);
      }
    } catch (error) {
      console.error('Error setting up auto login:', error);
    }
  }
}

export default new AuthService();
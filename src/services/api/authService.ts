import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from './auth';
import { getProfile } from './profileService'; 

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
export interface UserProfile {
  id: string;
  email: string;
  ho_ten: string;
  vai_tro: string;
  ngay_tao: string;
  kich_hoat: boolean;
}
export interface AuthError {
  error: string;
}

const STORAGE_KEYS = {
  TOKEN: 'accessToken',
  USER: 'userData',
  REMEMBER_ME: 'rememberMe',
} as const;

class AuthService {
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

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async getUser(forceRefresh: boolean = false): Promise<UserProfile | null> {
    try {
      if (!forceRefresh) {
        const cachedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        if (cachedUser) {
          try {
            return JSON.parse(cachedUser) as UserProfile;
          } catch (parseError) {
            console.error('Error parsing cached user:', parseError);
            // Cache bị lỗi, xóa và tiếp tục gọi API
            await AsyncStorage.removeItem(STORAGE_KEYS.USER);
          }
        }
      }

      // Kiểm tra token trước khi gọi API
      const token = await this.getToken();
      if (!token || this.isTokenExpired(token)) {
        console.log('No valid token, cannot fetch user profile');
        return null;
      }

      // Gọi API để lấy profile mới nhất
      try {
        const profile = await getProfile();

        // Lưu vào AsyncStorage để dùng cho lần sau
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(profile));

        return profile;
      } catch (apiError: any) {
        console.error('Error fetching user profile from API:', apiError);

        // Xử lý các lỗi từ API
        if (apiError.message?.includes('Token không hợp lệ') ||
          apiError.message?.includes('hết hạn')) {
          // Token hết hạn, logout user
          await this.logout();
          return null;
        }

        if (apiError.message?.includes('Không tìm thấy người dùng')) {
          // User không tồn tại, logout
          await this.logout();
          return null;
        }

        // Fallback: Với các lỗi khác (network, server), dùng cache cũ
        if (!forceRefresh) {
          const cachedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
          if (cachedUser) {
            console.log('Using cached user data as fallback due to API error');
            try {
              return JSON.parse(cachedUser) as UserProfile;
            } catch (parseError) {
              console.error('Error parsing fallback cached user:', parseError);
              await AsyncStorage.removeItem(STORAGE_KEYS.USER);
            }
          }
        }

        // Không có cache hoặc cache lỗi
        return null;
      }
    } catch (error) {
      console.error('Error in getUser:', error);
      return null;
    }
  }

  async getRememberMe(): Promise<boolean> {
    try {
      const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      return rememberMe === 'true';
    } catch (error) {
      console.error('Error getting remember me:', error);
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getToken();

      if (!token) return false;

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
  // Register API call
  async register({
    ho_ten,
    email,
    mat_khau,
  }: {
    ho_ten: string;
    email: string;
    mat_khau: string;
  }): Promise<any> {
    try {
      const response = await auth.post('/auth/register', {
        ho_ten,
        email,
        mat_khau,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.toLowerCase().includes('email')) {
        throw new Error('Email đã được sử dụng');
      }
      throw new Error('Đăng ký không thành công. Vui lòng thử lại.');
    }
  }

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

  setAuthHeader(token: string): void {
  const beforeHeader = auth.defaults.headers.common['Authorization'];
  auth.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  const afterHeader = auth.defaults.headers.common['Authorization'];
  const expectedHeader = `Bearer ${token}`;
  const isExactMatch = afterHeader === expectedHeader;
  const authHeaderCheck = auth.defaults.headers.common['Authorization'];
  const authHeaderLowerCheck = auth.defaults.headers.common['authorization'];
}

  removeAuthHeader(): void {
    delete auth.defaults.headers.common['Authorization'];
  }

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

  // Optional: Nếu bạn muốn cập nhật lại local sau khi sửa thông tin
  async refreshUser(): Promise<void> {
    const updated = await this.getUser();
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
  }
}

export default new AuthService();

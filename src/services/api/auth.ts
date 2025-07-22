import axios from 'axios';
import env from '../../constants/config';
import { Platform } from 'react-native';

const auth = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

auth.interceptors.request.use(
  async (config) => {
    // Get default auth header từ authService.setAuthHeader()
    const defaultAuthHeader = auth.defaults.headers.common['Authorization'];
    
    if (defaultAuthHeader) {
      if (Platform.OS === 'ios') {
        // iOS: Dùng X-Auth-Token thay vì Authorization
        config.headers['X-Auth-Token'] = defaultAuthHeader;
        // KHÔNG set Authorization header cho iOS
        delete config.headers.Authorization;
        
      } else {
        // Android: Dùng Authorization bình thường
        config.headers.Authorization = defaultAuthHeader;
        console.log('Android: Set Authorization header');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
auth.interceptors.response.use(
  (response) => {
    console.log('Response Success:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    if (Platform.OS === 'ios') {
      const sentXAuthToken = error.config?.headers?.['X-Auth-Token'];
    } else {
      const sentAuthHeader = error.config?.headers?.Authorization;
    }
    if (error.response?.status === 401) {
      try {
        const authService = await import('./authService');
        await authService.default.logout();
      } catch (importError) {console.error('Error importing authService for logout:', importError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default auth;
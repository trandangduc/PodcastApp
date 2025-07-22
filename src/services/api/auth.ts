// auth.ts - iOS Fix với X-Auth-Token (Keep Backend Unchanged)
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

// Request interceptor - iOS specific fix
auth.interceptors.request.use(
  async (config) => {
    console.log('\n🚀 ===== REQUEST INTERCEPTOR (iOS X-Auth-Token Fix) =====');
    console.log('🚀 Platform:', Platform.OS);
    console.log('🚀 URL:', config.url);
    
    // Get default auth header từ authService.setAuthHeader()
    const defaultAuthHeader = auth.defaults.headers.common['Authorization'];
    console.log('🚀 Default Authorization header:', defaultAuthHeader ? 'EXISTS' : 'NOT_SET');
    
    if (defaultAuthHeader) {
      if (Platform.OS === 'ios') {
        // iOS: Dùng X-Auth-Token thay vì Authorization
        config.headers['X-Auth-Token'] = defaultAuthHeader;
        console.log('📱 iOS: Set X-Auth-Token header');
        
        // KHÔNG set Authorization header cho iOS
        delete config.headers.Authorization;
        console.log('📱 iOS: Removed Authorization header');
        
      } else {
        // Android: Dùng Authorization bình thường
        config.headers.Authorization = defaultAuthHeader;
        console.log('🤖 Android: Set Authorization header');
      }
    }
    
    console.log('🚀 Final headers:', JSON.stringify(config.headers, null, 2));
    console.log('🚀 ===== REQUEST INTERCEPTOR END =====\n');
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
auth.interceptors.response.use(
  (response) => {
    console.log('✅ Response Success:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.log('\n🚫 ===== RESPONSE ERROR =====');
    console.log('🚫 Platform:', Platform.OS);
    console.log('🚫 Status:', error.response?.status);
    console.log('🚫 URL:', error.config?.url);
    
    if (Platform.OS === 'ios') {
      const sentXAuthToken = error.config?.headers?.['X-Auth-Token'];
      console.log('🚫 X-Auth-Token sent:', sentXAuthToken ? 'YES' : 'NO');
    } else {
      const sentAuthHeader = error.config?.headers?.Authorization;
      console.log('🚫 Authorization sent:', sentAuthHeader ? 'YES' : 'NO');
    }
    
    console.log('🚫 Server response:', JSON.stringify(error.response?.data, null, 2));
    console.log('🚫 ===== RESPONSE ERROR END =====\n');
    
    if (error.response?.status === 401) {
      console.log('🚫 401 Unauthorized - Token expired or invalid');
      
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
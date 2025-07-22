// src/api/auth.ts - FIXED (Option 1: Remove interceptor)
import axios from 'axios';
import env from '../../constants/config';

const auth = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ LOẠI BỎ interceptor để tránh conflict với authService.setAuthHeader()
// Token sẽ được manage hoàn toàn bởi authService.setAuthHeader()

// Response interceptor để handle 401 errors
auth.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.log('🚫 401 Unauthorized - Token expired or invalid');
      
      // Dynamic import để tránh circular dependency
      const authService = await import('../api/authService');
      await authService.default.logout();
    }
    
    return Promise.reject(error);
  }
);

export default auth;
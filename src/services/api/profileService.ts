import auth from './auth';
import { LoginResponse } from './authService';

export const getProfile = async (): Promise<LoginResponse['user']> => {
  try {
    const response = await auth.get('/users/profile');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    } else if (error.response?.status === 404) {
      throw new Error('Không tìm thấy người dùng');
    } else {
      throw new Error('Lỗi hệ thống');
    }
  }
};
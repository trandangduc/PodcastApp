import auth from './auth';

// Khai báo kiểu dữ liệu trả về từ API
export interface UserProfile {
  id: string;
  email: string;
  ho_ten: string;
  vai_tro: string;
  ngay_tao: string;
  kich_hoat: boolean;
}

// Hàm gọi API: GET /api/users/profile
export const getProfile = async (): Promise<UserProfile> => {
  try {
    const response = await auth.get<UserProfile>('/users/profile');
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.error;

    if (status === 401) {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    } else if (status === 404) {
      throw new Error('Không tìm thấy người dùng');
    } else {
      throw new Error(message || 'Lỗi hệ thống');
    }
  }
};

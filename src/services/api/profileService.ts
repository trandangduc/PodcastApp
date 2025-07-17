import auth from './auth';

export interface UserProfile {
  id: string;
  email: string;
  ho_ten: string;
  vai_tro: string;
  ngay_tao: string;
  kich_hoat: boolean;
}

// Lấy profile
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

// Cập nhật profile
export const updateProfile = async (
  data: Pick<UserProfile, 'ho_ten' | 'email'>
): Promise<{ message: string }> => {
  try {
    const response = await auth.put('/users/profile', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || 'Cập nhật thất bại');
  }
};

// Đổi mật khẩu
export const changePassword = async (data: {
  mat_khau_cu: string;
  mat_khau_moi: string;
}): Promise<{ message: string }> => {
  try {
    const response = await auth.post('/users/change-password', data);
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.error || 'Không đổi được mật khẩu';

    console.log('CHANGE PASSWORD ERROR:', message);

    if (status === 400) {
      // Trường hợp sai mật khẩu cũ, backend thường trả 400
      throw new Error(message);
    } else if (status === 401) {
      // Nếu có message rõ ràng thì ưu tiên hiển thị
      if (message.toLowerCase().includes('mật khẩu')) {
        throw new Error(message);
      }
      throw new Error('Phiên đăng nhập đã hết hạn');
    } else if (status === 404) {
      throw new Error('Không tìm thấy người dùng');
    } else {
      throw new Error(message);
    }
  }
};


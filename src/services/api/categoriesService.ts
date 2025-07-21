import auth from '../api/auth';
import { DanhMuc } from '../../types/index';

export interface CategoriesResponse {
  data: DanhMuc[];
  pagination: {
    limit: number;
    page: number;
    total: number;
    total_pages: number;
  };
}

export interface CategoryResponse {
  data: DanhMuc;
}

export interface GetCategoriesParams {
  search?: string;
  page?: number;
  limit?: number;
  status?: boolean;
}

export interface CreateCategoryData {
  ten_danh_muc: string;
  mo_ta: string;
}

export interface UpdateCategoryData {
  ten_danh_muc?: string;
  mo_ta?: string;
}

class CategoriesService {
  // GET /api/categories/ - Lấy danh sách danh mục
  async getCategories(params: GetCategoriesParams = {}): Promise<CategoriesResponse> {
    try {
      const {
        search,
        page = 1,
        limit = 10,
        status
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        queryParams.append('search', search);
      }

      if (status !== undefined) {
        queryParams.append('status', status.toString());
      }

      const response = await auth.get<CategoriesResponse>(
        `/categories?${queryParams.toString()}`
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      if (error.response?.status === 404) {
        return {
          data: [],
          pagination: {
            limit: params.limit || 10,
            page: params.page || 1,
            total: 0,
            total_pages: 0
          }
        };
      }
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      throw new Error('Không thể tải danh sách danh mục. Vui lòng thử lại.');
    }
  }

  // GET /api/categories/:id - Lấy danh mục theo ID
  async getCategoryById(id: string): Promise<CategoryResponse> {
    try {
      const response = await auth.get<CategoryResponse>(`/categories/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching category:', error);
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy danh mục');
      }
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      throw new Error('Không thể tải thông tin danh mục. Vui lòng thử lại.');
    }
  }

  // POST /api/categories/ - Tạo danh mục mới
  async createCategory(data: CreateCategoryData): Promise<CategoryResponse> {
    try {
      const response = await auth.post<CategoryResponse>('/categories', data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      if (error.response?.status === 400) {
        throw new Error('Dữ liệu không hợp lệ');
      }
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      throw new Error('Không thể tạo danh mục. Vui lòng thử lại.');
    }
  }

  // PUT /api/categories/:id - Cập nhật danh mục
  async updateCategory(id: string, data: UpdateCategoryData): Promise<CategoryResponse> {
    try {
      const response = await auth.put<CategoryResponse>(`/categories/${id}`, data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating category:', error);
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy danh mục');
      }
      if (error.response?.status === 400) {
        throw new Error('Dữ liệu không hợp lệ');
      }
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      throw new Error('Không thể cập nhật danh mục. Vui lòng thử lại.');
    }
  }

  // PUT /api/categories/:id/status - Cập nhật trạng thái danh mục
  async updateCategoryStatus(id: string, kich_hoat: boolean): Promise<CategoryResponse> {
    try {
      const response = await auth.put<CategoryResponse>(`/categories/${id}/status`, {
        kich_hoat
      });
      return response.data;
    } catch (error: any) {
      console.error('Error updating category status:', error);
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy danh mục');
      }
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      throw new Error('Không thể cập nhật trạng thái danh mục. Vui lòng thử lại.');
    }
  }

  // Lấy danh mục active để hiển thị
  async getActiveCategories(limit: number = 20): Promise<DanhMuc[]> {
    try {
      const response = await this.getCategories({
        status: true,
        limit
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active categories:', error);
      return [];
    }
  }
}

export default new CategoriesService();
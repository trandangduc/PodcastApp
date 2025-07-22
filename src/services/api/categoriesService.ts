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


  // Lấy danh mục active để hiển thị
  async getActiveCategories(limit: number = 10): Promise<DanhMuc[]> {
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
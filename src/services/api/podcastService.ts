import auth from '../api/auth';
import { Podcast, PodcastListResponse, PodcastDetailResponse } from '../../types/index';

export interface GetPodcastsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'most_viewed' | 'alphabetical' | 'duration_asc' | 'duration_desc';
}

export interface SearchPodcastsParams {
  query: string;
  page?: number;
  limit?: number;
  categoryId?: string;
  status?: 'bật' | 'tắt'; // Thêm parameter cho trạng thái
}

class PodcastService {
  private baseURL = 'https://podcastserver-production.up.railway.app/api';

  // APP-014: Kết nối API danh sách podcast với phân trang
  async getPodcasts(params: GetPodcastsParams = {}): Promise<PodcastListResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        categoryId,
        search,
        sort = 'newest'
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (categoryId) {
        queryParams.append('danh_muc_id', categoryId);
      }

      if (search) {
        queryParams.append('q', search);
      }

      // Mapping sort parameters
      switch (sort) {
        case 'newest':
          queryParams.append('sort', 'ngay_tao_ra');
          queryParams.append('order', 'desc');
          break;
        case 'oldest':
          queryParams.append('sort', 'ngay_tao_ra');
          queryParams.append('order', 'asc');
          break;
        case 'most_viewed':
          queryParams.append('sort', 'luot_xem');
          queryParams.append('order', 'desc');
          break;
        case 'alphabetical':
          queryParams.append('sort', 'tieu_de');
          queryParams.append('order', 'asc');
          break;
      }
      console.log('Fetching podcasts with params: /podcasts?', queryParams.toString());
      const response = await auth.get<PodcastListResponse>(
        `/podcasts/search?${queryParams.toString()}&trang_thai=bật`
      );

      return response.data;
    } catch (error: any) {
      console.error('Error fetching podcasts:', error);
      if (error.response?.status === 404) {
        // Return empty result for 404
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
      throw new Error('Không thể tải danh sách podcast. Vui lòng thử lại.');
    }
  }

  // APP-015: Kết nối API tìm kiếm với phân trang - FIXED
  async searchPodcasts(params: SearchPodcastsParams): Promise<PodcastListResponse> {
    try {
      const {
        query,
        page = 1,
        limit = 10,
        categoryId,
        status = 'bật' // Mặc định tìm kiếm podcast đã bật
      } = params;

      const queryParams = new URLSearchParams({
        q: query, // Sử dụng 'q' thay vì 'query' theo API spec
        page: page.toString(),
        limit: limit.toString(),
        trang_thai: status, // Thêm parameter trạng thái
      });

      if (categoryId) {
        queryParams.append('danh_muc_id', categoryId);
      }

      // Sửa URL để tránh duplicate path và sử dụng đúng endpoint
      const response = await auth.get<any>(`/podcasts/search?${queryParams.toString()}`);
      
      // Xử lý response format theo API trả về
      if (response.data.data && Array.isArray(response.data.data)) {
        // API trả về format: { data: [...] }
        return {
          data: response.data.data,
          pagination: response.data.pagination || {
            limit,
            page,
            total: response.data.data.length,
            total_pages: Math.ceil(response.data.data.length / limit)
          }
        };
      } else if (Array.isArray(response.data)) {
        // Trường hợp API trả về trực tiếp array
        return {
          data: response.data,
          pagination: {
            limit,
            page,
            total: response.data.length,
            total_pages: Math.ceil(response.data.length / limit)
          }
        };
      } else {
        // Empty result
        return {
          data: [],
          pagination: {
            limit,
            page,
            total: 0,
            total_pages: 0
          }
        };
      }
    } catch (error: any) {
      console.error('Error searching podcasts:', error);
      if (error.response?.status === 404) {
        // Return empty result for 404
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
      throw new Error('Không thể tìm kiếm podcast. Vui lòng thử lại.');
    }
  }

  // Tìm kiếm với sort - hàm mới để hỗ trợ sắp xếp trong tìm kiếm
  async searchPodcastsWithSort(params: SearchPodcastsParams & { 
    sort?: 'newest' | 'oldest' | 'most_viewed' | 'alphabetical';
  }): Promise<PodcastListResponse> {
    try {
      const {
        query,
        page = 1,
        limit = 10,
        categoryId,
        status = 'bật',
        sort = 'newest'
      } = params;

      const queryParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
        trang_thai: status,
      });

      if (categoryId) {
        queryParams.append('danh_muc_id', categoryId);
      }

      // Thêm sort parameters
      switch (sort) {
        case 'newest':
          queryParams.append('sort', 'ngay_tao_ra');
          queryParams.append('order', 'desc');
          break;
        case 'oldest':
          queryParams.append('sort', 'ngay_tao_ra');
          queryParams.append('order', 'asc');
          break;
        case 'most_viewed':
          queryParams.append('sort', 'luot_xem');
          queryParams.append('order', 'desc');
          break;
        case 'alphabetical':
          queryParams.append('sort', 'tieu_de');
          queryParams.append('order', 'asc');
          break;
      }

      const response = await auth.get<any>(`/podcasts/search?${queryParams.toString()}`);
      
      // Xử lý response format theo API trả về
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          data: response.data.data,
          pagination: response.data.pagination || {
            limit,
            page,
            total: response.data.data.length,
            total_pages: Math.ceil(response.data.data.length / limit)
          }
        };
      } else if (Array.isArray(response.data)) {
        return {
          data: response.data,
          pagination: {
            limit,
            page,
            total: response.data.length,
            total_pages: Math.ceil(response.data.length / limit)
          }
        };
      } else {
        return {
          data: [],
          pagination: {
            limit,
            page,
            total: 0,
            total_pages: 0
          }
        };
      }
    } catch (error: any) {
      console.error('Error searching podcasts with sort:', error);
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
      throw new Error('Không thể tìm kiếm podcast. Vui lòng thử lại.');
    }
  }

  // APP-016: Kết nối API chi tiết podcast
  async getPodcastById(id: string): Promise<PodcastDetailResponse> {
    try {
      const response = await auth.get<PodcastDetailResponse>(`/podcasts/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching podcast detail:', error);
      if (error.response?.status === 404) {
        throw new Error('Không tìm thấy podcast');
      }
      if (error.response?.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      throw new Error('Không thể tải chi tiết podcast. Vui lòng thử lại.');
    }
  }

  // Lấy podcast theo danh mục với phân trang
  async getPodcastsByCategory(categoryId: string, params: GetPodcastsParams = {}): Promise<PodcastListResponse> {
    return this.getPodcasts({ ...params, categoryId });
  }

  // Lấy podcast phổ biến với phân trang
  async getPopularPodcasts(page: number = 1, limit: number = 10): Promise<PodcastListResponse> {
    try {
      const response = await this.getPodcasts({
        page,
        limit,
        sort: 'most_viewed'
      });
      return response;
    } catch (error) {
      console.error('Error fetching popular podcasts:', error);
      throw error;
    }
  }

  // Lấy podcast mới nhất với phân trang
  async getLatestPodcasts(page: number = 1, limit: number = 10): Promise<PodcastListResponse> {
    try {
      const response = await this.getPodcasts({
        page,
        limit,
        sort: 'newest'
      });
      return response;
    } catch (error) {
      console.error('Error fetching latest podcasts:', error);
      throw error;
    }
  }

  // Lấy podcast gợi ý với phân trang
  async getRecommendedPodcasts(page: number = 1, limit: number = 10): Promise<PodcastListResponse> {
    try {
      // TODO: Implement recommendation algorithm
      // For now, return popular podcasts
      return this.getPopularPodcasts(page, limit);
    } catch (error) {
      console.error('Error fetching recommended podcasts:', error);
      throw error;
    }
  }

  // Lấy podcast gợi ý từ chi tiết podcast
  async getSuggestedPodcasts(podcastId: string): Promise<Podcast[]> {
    try {
      const response = await this.getPodcastById(podcastId);
      return response.suggest || [];
    } catch (error) {
      console.error('Error fetching suggested podcasts:', error);
      return [];
    }
  }
}

export default new PodcastService();
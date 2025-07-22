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
        queryParams.append('search', search);
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

      const response = await auth.get<PodcastListResponse>(
        `/podcasts?${queryParams.toString()}`
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

  // APP-015: Kết nối API tìm kiếm với phân trang
  async searchPodcasts(params: SearchPodcastsParams): Promise<PodcastListResponse> {
    try {
      const {
        query,
        page = 1,
        limit = 10,
        categoryId
      } = params;

      const queryParams = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (categoryId) {
        queryParams.append('danh_muc_id', categoryId);
      }

      const response = await auth.get<any>(`/podcasts/search?${queryParams.toString()}&trang_thai='bật'`);

      // Handle response format - search API trả về format khác
      if (response.data.data && Array.isArray(response.data.data)) {
        // Có pagination
        return {
          data: response.data.data,
          pagination: response.data.pagination || {
            limit,
            page,
            total: response.data.data.length,
            total_pages: 1
          }
        };
      } else if (Array.isArray(response.data.data)) {
        // Không có pagination, chỉ có data array
        return {
          data: response.data.data,
          pagination: {
            limit,
            page,
            total: response.data.data.length,
            total_pages: 1
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
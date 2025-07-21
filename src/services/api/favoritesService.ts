import AsyncStorage from '@react-native-async-storage/async-storage';
import { Podcast } from '../../types/index';

const FAVORITES_STORAGE_KEY = 'favorite_podcasts';
const FAVORITES_DETAILS_STORAGE_KEY = 'favorite_podcasts_details';

export interface FavoritePodcast {
  id: string;
  title: string;
  thumbnail: string;
  addedAt: string;
}

class FavoritesService {
  // Thêm podcast vào danh sách yêu thích
  async addToFavorites(podcast: Podcast): Promise<void> {
    try {
      // Lấy danh sách ID yêu thích hiện tại
      const currentFavorites = await this.getFavoriteIds();
      
      // Kiểm tra đã có trong danh sách chưa
      if (currentFavorites.includes(podcast.id)) {
        throw new Error('Podcast đã có trong danh sách yêu thích');
      }

      // Thêm ID mới
      const updatedFavorites = [...currentFavorites, podcast.id];
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));

      // Lưu chi tiết podcast để hiển thị nhanh
      const favoritePodcast: FavoritePodcast = {
        id: podcast.id,
        title: podcast.tieu_de,
        thumbnail: podcast.hinh_anh_dai_dien || '',
        addedAt: new Date().toISOString(),
      };

      const currentDetails = await this.getFavoriteDetails();
      const updatedDetails = [...currentDetails, favoritePodcast];
      await AsyncStorage.setItem(FAVORITES_DETAILS_STORAGE_KEY, JSON.stringify(updatedDetails));

    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      throw new Error(error.message || 'Không thể thêm vào danh sách yêu thích');
    }
  }

  // Xóa podcast khỏi danh sách yêu thích
  async removeFromFavorites(podcastId: string): Promise<void> {
    try {
      // Xóa ID
      const currentFavorites = await this.getFavoriteIds();
      const updatedFavorites = currentFavorites.filter(id => id !== podcastId);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updatedFavorites));

      // Xóa chi tiết
      const currentDetails = await this.getFavoriteDetails();
      const updatedDetails = currentDetails.filter(item => item.id !== podcastId);
      await AsyncStorage.setItem(FAVORITES_DETAILS_STORAGE_KEY, JSON.stringify(updatedDetails));

    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      throw new Error('Không thể xóa khỏi danh sách yêu thích');
    }
  }

  // Kiểm tra podcast có trong danh sách yêu thích không
  async isFavorite(podcastId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavoriteIds();
      return favorites.includes(podcastId);
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  }

  // Toggle trạng thái yêu thích
  async toggleFavorite(podcast: Podcast): Promise<boolean> {
    try {
      const isCurrentlyFavorite = await this.isFavorite(podcast.id);
      
      if (isCurrentlyFavorite) {
        await this.removeFromFavorites(podcast.id);
        return false;
      } else {
        await this.addToFavorites(podcast);
        return true;
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      throw error;
    }
  }

  // Lấy danh sách ID podcast yêu thích
  async getFavoriteIds(): Promise<string[]> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorite IDs:', error);
      return [];
    }
  }

  // Lấy chi tiết podcast yêu thích (để hiển thị nhanh)
  async getFavoriteDetails(): Promise<FavoritePodcast[]> {
    try {
      const details = await AsyncStorage.getItem(FAVORITES_DETAILS_STORAGE_KEY);
      return details ? JSON.parse(details) : [];
    } catch (error) {
      console.error('Error getting favorite details:', error);
      return [];
    }
  }

  // Lấy số lượng podcast yêu thích
  async getFavoriteCount(): Promise<number> {
    try {
      const favorites = await this.getFavoriteIds();
      return favorites.length;
    } catch (error) {
      console.error('Error getting favorite count:', error);
      return 0;
    }
  }

  // Xóa tất cả podcast yêu thích
  async clearAllFavorites(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
      await AsyncStorage.removeItem(FAVORITES_DETAILS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing favorites:', error);
      throw new Error('Không thể xóa danh sách yêu thích');
    }
  }

  // Đồng bộ chi tiết podcast yêu thích với danh sách ID
  // (gọi khi có thay đổi từ nguồn khác)
  async syncFavoriteDetails(podcasts: Podcast[]): Promise<void> {
    try {
      const favoriteIds = await this.getFavoriteIds();
      const favoriteDetails: FavoritePodcast[] = [];

      for (const podcast of podcasts) {
        if (favoriteIds.includes(podcast.id)) {
          favoriteDetails.push({
            id: podcast.id,
            title: podcast.tieu_de,
            thumbnail: podcast.hinh_anh_dai_dien || '',
            addedAt: new Date().toISOString(), // Không có thông tin thời gian thêm thực tế
          });
        }
      }

      await AsyncStorage.setItem(FAVORITES_DETAILS_STORAGE_KEY, JSON.stringify(favoriteDetails));
    } catch (error) {
      console.error('Error syncing favorite details:', error);
    }
  }

  // Import/Export favorites (để backup hoặc chuyển đổi thiết bị)
  async exportFavorites(): Promise<string> {
    try {
      const favoriteIds = await this.getFavoriteIds();
      const favoriteDetails = await this.getFavoriteDetails();
      
      const exportData = {
        ids: favoriteIds,
        details: favoriteDetails,
        exportedAt: new Date().toISOString(),
      };

      return JSON.stringify(exportData);
    } catch (error) {
      console.error('Error exporting favorites:', error);
      throw new Error('Không thể xuất danh sách yêu thích');
    }
  }

  async importFavorites(importData: string): Promise<void> {
    try {
      const data = JSON.parse(importData);
      
      if (data.ids && Array.isArray(data.ids)) {
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(data.ids));
      }
      
      if (data.details && Array.isArray(data.details)) {
        await AsyncStorage.setItem(FAVORITES_DETAILS_STORAGE_KEY, JSON.stringify(data.details));
      }
    } catch (error) {
      console.error('Error importing favorites:', error);
      throw new Error('Không thể nhập danh sách yêu thích');
    }
  }

  // Migration function để chuyển từ ID number sang string (nếu cần)
  async migrateFavoriteIds(): Promise<void> {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (favorites) {
        const favoriteList = JSON.parse(favorites);
        // Check if any item is number, convert to string
        const migratedList = favoriteList.map((id: any) => 
          typeof id === 'number' ? id.toString() : id
        );
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(migratedList));
      }
    } catch (error) {
      console.error('Error migrating favorite IDs:', error);
    }
  }
}

export default new FavoritesService();
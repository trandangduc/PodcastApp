import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import favoritesService, { FavoritePodcast } from '../../services/api/favoritesService';

const FavoritesScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<FavoritePodcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // Migration cho old data (nếu có)
      await favoritesService.migrateFavoriteIds();
      
      const favoriteList = await favoritesService.getFavoriteDetails();
      // Sắp xếp theo thời gian thêm mới nhất
      const sortedFavorites = favoriteList.sort((a, b) => 
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
      setFavorites(sortedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách yêu thích');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const handleRemoveFromFavorites = async (podcastId: string) => {
    Alert.alert(
      'Xóa khỏi yêu thích',
      'Bạn có chắc chắn muốn xóa podcast này khỏi danh sách yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesService.removeFromFavorites(podcastId);
              setFavorites(prev => prev.filter(item => item.id !== podcastId));
              Alert.alert('Thành công', 'Đã xóa khỏi danh sách yêu thích');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa khỏi danh sách yêu thích');
            }
          },
        },
      ]
    );
  };

  const handleClearAllFavorites = () => {
    if (favorites.length === 0) return;

    Alert.alert(
      'Xóa tất cả',
      'Bạn có chắc chắn muốn xóa tất cả podcast khỏi danh sách yêu thích?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa tất cả',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesService.clearAllFavorites();
              setFavorites([]);
              Alert.alert('Thành công', 'Đã xóa tất cả podcast yêu thích');
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa danh sách yêu thích');
            }
          },
        },
      ]
    );
  };

  const handlePodcastPress = (podcast: FavoritePodcast) => {
    navigation.navigate('PodcastDetail', { podcastId: podcast.id });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} tuần trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  const renderFavoriteItem = ({ item }: { item: FavoritePodcast }) => (
    <TouchableOpacity 
      style={styles.favoriteItem} 
      onPress={() => handlePodcastPress(item)}
    >
      <Image 
        source={{ 
          uri: item.thumbnail || 'https://via.placeholder.com/60x60/1e1e1e/4CAF50?text=No+Image' 
        }} 
        style={styles.thumbnail} 
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.addedDate}>Đã thêm {formatDate(item.addedAt)}</Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveFromFavorites(item.id)}
      >
        <Ionicons name="heart" size={24} color="#ff4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // ✅ Đã bỏ icon back
  const renderHeader = () => (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <Text style={styles.headerTitle}>Yêu thích ({favorites.length})</Text>
      <TouchableOpacity 
        style={styles.clearButton}
        onPress={handleClearAllFavorites}
      >
        <Ionicons name="trash-outline" size={24} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-outline" size={80} color="#666" />
      <Text style={styles.emptyTitle}>Chưa có podcast yêu thích</Text>
      <Text style={styles.emptyDescription}>
        Hãy thêm các podcast yêu thích để dễ dàng tìm lại sau này
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.exploreButtonText}>Khám phá podcast</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      
      {favorites.length === 0 && !loading ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4CAF50"
              colors={['#4CAF50']}
            />
          }
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // ✅ Giữ space-between để title căn giữa và nút clear ở bên phải
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1a1a1a',
  },
  // ✅ Đã xóa backButton style vì không cần nữa
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1, // ✅ Giữ flex: 1 để title vẫn căn giữa
    textAlign: 'center',
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addedDate: {
    color: '#aaa',
    fontSize: 12,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyDescription: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  exploreButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;
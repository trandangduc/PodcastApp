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
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import favoritesService, { FavoritePodcast } from '../../services/api/favoritesService';

const { width } = Dimensions.get('window');

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

  const renderFavoriteItem = ({ item, index }: { item: FavoritePodcast; index: number }) => (
    <TouchableOpacity 
      style={[styles.favoriteItem, index === 0 && styles.firstItem]} 
      onPress={() => handlePodcastPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.itemContent}>
        <Image 
          source={{ 
            uri: item.thumbnail || 'https://via.placeholder.com/56x56/282828/1DB954?text=♪' 
          }} 
          style={styles.thumbnail} 
        />
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            Đã thêm {formatDate(item.addedAt)}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveFromFavorites(item.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="heart" size={20} color="#1DB954" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#1DB954', '#1ed760', '#121212']}
      style={[styles.headerGradient, { paddingTop: insets.top }]}
      locations={[0, 0.3, 1]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1DB954" />
      
      {/* Header với icon và title */}
      <View style={styles.headerContent}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={handleClearAllFavorites}
          >
            <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Large title section */}
        <View style={styles.titleSection}>
          <View style={styles.playlistIconContainer}>
            <LinearGradient
              colors={['#1DB954', '#1ed760']}
              style={styles.playlistIcon}
            >
              <Ionicons name="heart" size={60} color="#fff" />
            </LinearGradient>
          </View>
          
          <Text style={styles.playlistTitle}>Yêu thích</Text>
          <Text style={styles.playlistInfo}>
            {favorites.length} podcast • Được tạo bởi bạn
          </Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.shuffleButton}>
            <Ionicons name="shuffle" size={20} color="#000" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.playButton}>
            <Ionicons name="play" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <LinearGradient
        colors={['#1DB954', '#1ed760']}
        style={styles.emptyIcon}
      >
        <Ionicons name="heart-outline" size={40} color="#fff" />
      </LinearGradient>
      
      <Text style={styles.emptyTitle}>Bắt đầu thêm podcast yêu thích</Text>
      <Text style={styles.emptyDescription}>
        Nhấn vào biểu tượng trái tim trên bất kỳ podcast nào để thêm vào đây
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {favorites.length === 0 && !loading ? (
        <>
          {renderHeader()}
          {renderEmptyState()}
        </>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderFavoriteItem}
          ListHeaderComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#1DB954"
              colors={['#1DB954']}
              progressViewOffset={300}
            />
          }
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: insets.bottom + 100 }
          ]}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[]}
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
  headerGradient: {
    paddingBottom: 20,
  },
  headerContent: {
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 10,
  },

  moreButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  playlistIconContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  playlistIcon: {
    width: 120,
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  playlistInfo: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
  },
  shuffleButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  listContainer: {
    paddingTop: 0,
  },
  favoriteItem: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  firstItem: {
    paddingTop: 16,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 4,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: '400',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#b3b3b3',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  browseButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FavoritesScreen;
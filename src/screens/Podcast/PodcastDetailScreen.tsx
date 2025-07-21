import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Share,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Podcast } from '../../types';
import podcastService from '../../services/api/podcastService';
import favoritesService from '../../services/api/favoritesService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive constants
const isTablet = SCREEN_WIDTH >= 768;
const THUMBNAIL_SIZE = isTablet ? 300 : 250;
const SUGGESTED_ITEM_WIDTH = isTablet ? 220 : 200;

const PodcastDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const podcastId = route.params?.podcastId;

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [suggestedPodcasts, setSuggestedPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    if (podcastId) {
      loadPodcastDetail();
      checkFavoriteStatus();
    }
  }, [podcastId]);

  const loadPodcastDetail = async () => {
    try {
      setLoading(true);
      
      const response = await podcastService.getPodcastById(podcastId);
      setPodcast(response.data);
      setSuggestedPodcasts(response.suggest || []);
      
    } catch (error: any) {
      console.error('Error loading podcast detail:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải chi tiết podcast');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async () => {
    try {
      const favorite = await favoritesService.isFavorite(podcastId);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!podcast) return;
    
    try {
      setFavoriteLoading(true);
      
      const newFavoriteStatus = await favoritesService.toggleFavorite(podcast);
      setIsFavorite(newFavoriteStatus);
      
      Alert.alert(
        'Thành công', 
        newFavoriteStatus ? 'Đã thêm vào danh sách yêu thích' : 'Đã xóa khỏi danh sách yêu thích'
      );
      
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Lỗi', error.message || 'Không thể cập nhật danh sách yêu thích');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    if (!podcast) return;
    
    try {
      await Share.share({
        message: `Nghe podcast "${podcast.tieu_de}" - ${podcast.mo_ta}`,
        title: podcast.tieu_de,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handlePlay = () => {
  navigation.navigate('AudioPlayerScreen', { podcastId: podcast?.id });
};


  const handleSuggestedPodcastPress = useCallback((suggestedPodcast: Podcast) => {
    navigation.push('PodcastDetail', { podcastId: suggestedPodcast.id });
  }, [navigation]);

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString || dateString === '0001-01-01T00:00:00Z') {
      return 'Chưa xác định';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderTags = useMemo(() => {
    if (!podcast?.the_tag) return null;
    
    const tags = podcast.the_tag.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    if (tags.length === 0) return null;
    
    return (
      <View style={styles.tagsContainer}>
        <Text style={styles.sectionTitle}>Thẻ tag</Text>
        <View style={styles.tagsWrapper}>
          {tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }, [podcast?.the_tag]);

  const renderSuggestedPodcast = useCallback(({ item }: { item: Podcast }) => (
    <TouchableOpacity 
      style={[styles.suggestedItem, { width: SUGGESTED_ITEM_WIDTH }]} 
      onPress={() => handleSuggestedPodcastPress(item)}
    >
      <Image 
        source={{ 
          uri: item.hinh_anh_dai_dien || 'https://via.placeholder.com/120x120/1e1e1e/4CAF50?text=No+Image' 
        }} 
        style={styles.suggestedThumbnail} 
        resizeMode="cover"
      />
      <View style={styles.suggestedContent}>
        <Text style={styles.suggestedTitle} numberOfLines={2}>{item.tieu_de}</Text>
        <Text style={styles.suggestedMeta}>
          {formatDuration(item.thoi_luong_giay)} • {formatViews(item.luot_xem)} lượt xem
        </Text>
      </View>
    </TouchableOpacity>
  ), [handleSuggestedPodcastPress]);

  const renderSuggestedPodcasts = useMemo(() => {
    if (suggestedPodcasts.length === 0) return null;
    
    return (
      <View style={styles.suggestedContainer}>
        <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
        <FlatList
          data={suggestedPodcasts}
          keyExtractor={(item) => item.id}
          renderItem={renderSuggestedPodcast}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedList}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      </View>
    );
  }, [suggestedPodcasts, renderSuggestedPodcast]);

  // Header component
  const renderHeader = useMemo(() => (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity 
        style={styles.headerButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Chi tiết Podcast</Text>
      <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
        <Ionicons name="share-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  ), [insets.top, navigation, handleShare]);

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader}
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (!podcast) {
    return (
      <View style={styles.container}>
        {renderHeader}
        <View style={styles.centerLoader}>
          <Text style={styles.errorText}>Không tìm thấy podcast</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader}
      
      {/* Main Content */}
      <View style={styles.contentWrapper}>
        <ScrollView 
          style={styles.content}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 120 } // Extra space for bottom play bar + safe area
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Thumbnail và Play Button */}
          <View style={styles.thumbnailContainer}>
            <Image 
              source={{ 
                uri: podcast.hinh_anh_dai_dien || 'https://via.placeholder.com/250x250/1e1e1e/4CAF50?text=No+Image' 
              }} 
              style={[styles.thumbnail, { width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }]}
              resizeMode="cover"
            />
            <TouchableOpacity style={styles.playButtonLarge} onPress={handlePlay}>
              <Ionicons name="play" size={isTablet ? 40 : 32} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Tiêu đề và thông tin cơ bản */}
          <View style={styles.infoContainer}>
            <Text style={styles.title}>{podcast.tieu_de}</Text>
            
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color="#4CAF50" />
                <Text style={styles.metaText}>{formatDuration(podcast.thoi_luong_giay)}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={16} color="#4CAF50" />
                <Text style={styles.metaText}>{formatViews(podcast.luot_xem)} lượt xem</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color="#4CAF50" />
                <Text style={styles.metaText}>{formatDate(podcast.ngay_tao_ra)}</Text>
              </View>
            </View>

            <View style={styles.statusRow}>
              <View style={[
                styles.statusBadge, 
                { backgroundColor: podcast.trang_thai === 'Bật' ? '#4CAF50' : '#ff4444' }
              ]}>
                <Text style={styles.statusText}>{podcast.trang_thai}</Text>
              </View>
              {podcast.ngay_xuat_ban && (
                <Text style={styles.publishText}>
                  Xuất bản: {formatDate(podcast.ngay_xuat_ban)}
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.favoriteButton]} 
              onPress={toggleFavorite}
              disabled={favoriteLoading}
            >
              {favoriteLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={20} 
                  color="#fff" 
                />
              )}
              <Text style={styles.actionButtonText}>
                {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Mô tả */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{podcast.mo_ta}</Text>
          </View>

          {/* Tags */}
          {renderTags}

          {/* Suggested Podcasts */}
          {renderSuggestedPodcasts}
        </ScrollView>

        {/* Bottom Play Bar - Fixed position with safe area */}
        <View style={[styles.bottomPlayBar, { paddingBottom: insets.bottom + 10 }]}>
          <TouchableOpacity style={styles.bottomPlayButton} onPress={handlePlay}>
            <Ionicons name="play-circle" size={50} color="#4CAF50" />
          </TouchableOpacity>
          <View style={styles.bottomPlayInfo}>
            <Text style={styles.bottomPlayTitle} numberOfLines={1}>
              {podcast.tieu_de}
            </Text>
            <Text style={styles.bottomPlayMeta}>
              {formatDuration(podcast.thoi_luong_giay)} • {formatViews(podcast.luot_xem)} lượt xem
            </Text>
          </View>
        </View>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#1a1a1a',
    zIndex: 10,
  },
  headerButton: {
    width: isTablet ? 45 : 40,
    height: isTablet ? 45 : 40,
    borderRadius: isTablet ? 22.5 : 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaa',
    marginTop: 10,
    fontSize: isTablet ? 16 : 14,
  },
  errorText: {
    color: '#ff4444',
    fontSize: isTablet ? 18 : 16,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    margin: 20,
    alignItems: 'center',
  },
  thumbnail: {
    borderRadius: 15,
  },
  playButtonLarge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: isTablet ? -35 : -30,
    marginLeft: isTablet ? -35 : -30,
    width: isTablet ? 70 : 60,
    height: isTablet ? 70 : 60,
    borderRadius: isTablet ? 35 : 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: isTablet ? 28 : 24,
    fontWeight: 'bold',
    marginBottom: 15,
    lineHeight: isTablet ? 34 : 30,
  },
  metaRow: {
    flexDirection: isTablet ? 'row' : 'column',
    justifyContent: 'space-between',
    marginBottom: 15,
    gap: isTablet ? 0 : 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: isTablet ? 1 : undefined,
  },
  metaText: {
    color: '#4CAF50',
    fontSize: isTablet ? 14 : 12,
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
  },
  publishText: {
    color: '#aaa',
    fontSize: isTablet ? 14 : 12,
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 15 : 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
  },
  favoriteButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    color: '#ccc',
    fontSize: isTablet ? 18 : 16,
    lineHeight: isTablet ? 26 : 24,
  },
  tagsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  tagText: {
    color: '#4CAF50',
    fontSize: isTablet ? 16 : 14,
  },
  suggestedContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  suggestedList: {
    paddingRight: 20,
  },
  suggestedItem: {
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
  },
  suggestedThumbnail: {
    width: '100%',
    height: isTablet ? 140 : 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestedContent: {
    flex: 1,
  },
  suggestedTitle: {
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  suggestedMeta: {
    color: '#aaa',
    fontSize: isTablet ? 14 : 12,
  },
  bottomPlayBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1e1e1e',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  bottomPlayButton: {
    marginRight: 12,
  },
  bottomPlayInfo: {
    flex: 1,
  },
  bottomPlayTitle: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  bottomPlayMeta: {
    color: '#aaa',
    fontSize: isTablet ? 14 : 12,
  },
});

export default PodcastDetailScreen;
// PodcastContent.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Podcast } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isTablet = SCREEN_WIDTH >= 768;
const HERO_HEIGHT = isTablet ? 400 : 350;
const IMAGE_SIZE = isTablet ? 280 : 240;
const SUGGESTED_ITEM_WIDTH = isTablet ? 180 : 160;

interface PodcastContentProps {
  podcast: Podcast | null;
  suggestedPodcasts: Podcast[];
  loading: boolean;
  isFavorite: boolean;
  favoriteLoading: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
  onSuggestedPodcastPress: (podcast: Podcast) => void;
  insets: any;
}

const PodcastContent: React.FC<PodcastContentProps> = ({
  podcast,
  suggestedPodcasts,
  loading,
  isFavorite,
  favoriteLoading,
  onPlay,
  onToggleFavorite,
  onSuggestedPodcastPress,
  insets,
}) => {
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Utility functions
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
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

  // Loading state
  if (loading) {
    return (
      <View style={styles.centerLoader}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  // Error state
  if (!podcast) {
    return (
      <View style={styles.centerLoader}>
        <Ionicons name="alert-circle-outline" size={64} color="#E22134" />
        <Text style={styles.errorText}>Không tìm thấy podcast</Text>
      </View>
    );
  }

  // Hero Section Component
  const HeroSection = () => (
    <View style={styles.heroContainer}>
      <Image 
        source={{ 
          uri: podcast.hinh_anh_dai_dien || 'https://via.placeholder.com/400x400/121212/1DB954?text=No+Image' 
        }} 
        style={styles.backgroundImage}
        blurRadius={20}
      />
      
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.gradientOverlay}
      />
      
      <View style={styles.heroContent}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: podcast.hinh_anh_dai_dien || 'https://via.placeholder.com/280x280/121212/1DB954?text=No+Image' 
            }} 
            style={styles.podcastImage}
            resizeMode="cover"
          />
          
          <TouchableOpacity style={styles.playButton} onPress={onPlay}>
            <View style={styles.playButtonInner}>
              <Ionicons name="play" size={isTablet ? 36 : 32} color="#000000" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Info Section Component
  const InfoSection = () => (
    <View style={styles.infoSection}>
      <Text style={styles.title}>{podcast.tieu_de}</Text>
      
      <View style={styles.metaContainer}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#1DB954" />
            <Text style={styles.metaText}>{formatDuration(podcast.thoi_luong_giay)}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Ionicons name="eye-outline" size={16} color="#1DB954" />
            <Text style={styles.metaText}>{formatViews(podcast.luot_xem)} lượt xem</Text>
          </View>
        </View>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color="#1DB954" />
            <Text style={styles.metaText}>{formatDate(podcast.ngay_tao_ra)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: podcast.trang_thai === 'Bật' ? '#1DB954' : '#E22134' }
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
  );

  // Action Buttons Component
  const ActionButtons = () => (
    <View style={styles.actionContainer}>
      <TouchableOpacity 
        style={[
          styles.actionButton,
          isFavorite ? styles.favoriteActive : styles.favoriteInactive
        ]} 
        onPress={onToggleFavorite}
        disabled={favoriteLoading}
      >
        {favoriteLoading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Ionicons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={20} 
            color="#ffffff" 
          />
        )}
        <Text style={styles.actionButtonText}>
          {isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton}>
        <Ionicons name="download-outline" size={20} color="#B3B3B3" />
        <Text style={styles.secondaryButtonText}>Tải xuống</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton}>
        <Ionicons name="ellipsis-horizontal" size={20} color="#B3B3B3" />
      </TouchableOpacity>
    </View>
  );

  // Description Component
  const Description = () => {
    const maxLength = 150;
    const shouldTruncate = podcast.mo_ta.length > maxLength;
    const displayText = descriptionExpanded || !shouldTruncate 
      ? podcast.mo_ta 
      : podcast.mo_ta.substring(0, maxLength) + '...';

    return (
      <View style={styles.descriptionContainer}>
        <Text style={styles.sectionTitle}>Giới thiệu</Text>
        <Text style={styles.description}>{displayText}</Text>
        
        {shouldTruncate && (
          <TouchableOpacity onPress={() => setDescriptionExpanded(!descriptionExpanded)}>
            <Text style={styles.toggleText}>
              {descriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Tags Component
  const Tags = () => {
    if (!podcast?.the_tag) return null;
    
    const tagArray = podcast.the_tag.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (tagArray.length === 0) return null;

    return (
      <View style={styles.tagsContainer}>
        <Text style={styles.sectionTitle}>Thể loại</Text>
        <View style={styles.tagsWrapper}>
          {tagArray.map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Suggested Podcasts Component
  const SuggestedPodcasts = () => {
    if (suggestedPodcasts.length === 0) return null;

    const renderSuggestedItem = ({ item }: { item: Podcast }) => (
      <TouchableOpacity 
        style={styles.suggestedItem} 
        onPress={() => onSuggestedPodcastPress(item)}
      >
        <Image 
          source={{ 
            uri: item.hinh_anh_dai_dien || 'https://via.placeholder.com/120x120/121212/1DB954?text=No+Image' 
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
    );

    return (
      <View style={styles.suggestedContainer}>
        <Text style={styles.sectionTitle}>Gợi ý cho bạn</Text>
        <FlatList
          data={suggestedPodcasts}
          keyExtractor={(item) => item.id}
          renderItem={renderSuggestedItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedList}
        />
      </View>
    );
  };

  // Bottom Play Bar Component
  const BottomPlayBar = () => (
    <View style={[styles.bottomPlayBar, { paddingBottom: insets.bottom + 10 }]}>
      <TouchableOpacity style={styles.bottomPlayButton} onPress={onPlay}>
        <Ionicons name="play-circle" size={56} color="#1DB954" />
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
  );

  return (
    <View style={styles.contentWrapper}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection />
        
        <View style={styles.mainContent}>
          <InfoSection />
          <ActionButtons />
          <Description />
          <Tags />
          <SuggestedPodcasts />
        </View>
      </ScrollView>
      
      <BottomPlayBar />
    </View>
  );
};

const styles = StyleSheet.create({
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
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#B3B3B3',
    marginTop: 16,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#E22134',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    marginTop: 16,
  },
  
  // Hero Section
  heroContainer: {
    height: HERO_HEIGHT,
    position: 'relative',
    marginBottom: 24,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 16,
  },
  podcastImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
  },
  playButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  playButtonInner: {
    width: isTablet ? 64 : 56,
    height: isTablet ? 64 : 56,
    borderRadius: isTablet ? 32 : 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },

  // Main Content
  mainContent: {
    paddingHorizontal: 16,
  },
  
  // Info Section
  infoSection: {
    marginBottom: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: isTablet ? 32 : 28,
    fontWeight: 'bold',
    marginBottom: 16,
    lineHeight: isTablet ? 40 : 36,
  },
  metaContainer: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 24,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#B3B3B3',
    fontSize: isTablet ? 16 : 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: 'bold',
  },
  publishText: {
    color: '#B3B3B3',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '500',
  },

  // Action Buttons
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: 140,
  },
  favoriteActive: {
    backgroundColor: '#1DB954',
  },
  favoriteInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: '#535353',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isTablet ? 12 : 10,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: '#B3B3B3',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  // Common
  sectionTitle: {
    color: '#ffffff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  // Description
  descriptionContainer: {
    marginBottom: 32,
  },
  description: {
    color: '#B3B3B3',
    fontSize: isTablet ? 16 : 14,
    lineHeight: isTablet ? 24 : 20,
    marginBottom: 8,
  },
  toggleText: {
    color: '#1DB954',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },

  // Tags
  tagsContainer: {
    marginBottom: 32,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#535353',
  },
  tagText: {
    color: '#ffffff',
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
  },

  // Suggested Podcasts
  suggestedContainer: {
    marginBottom: 32,
  },
  suggestedList: {
    paddingRight: 16,
  },
  suggestedItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: SUGGESTED_ITEM_WIDTH,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#ffffff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  suggestedMeta: {
    color: '#B3B3B3',
    fontSize: isTablet ? 14 : 12,
  },

  // Bottom Play Bar
  bottomPlayBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(18, 18, 18, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomPlayButton: {
    marginRight: 12,
  },
  bottomPlayInfo: {
    flex: 1,
  },
  bottomPlayTitle: {
    color: '#ffffff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  bottomPlayMeta: {
    color: '#B3B3B3',
    fontSize: isTablet ? 14 : 12,
  },
});

export default PodcastContent;
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  ColorValue,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { homeStyles as styles, colors, gradientColors } from '../styles/homeStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Type definitions based on your provided interfaces
interface User {
  id: string;
  email: string;
  ho_ten: string;
  vai_tro: 'admin' | 'nguoi_dung';
  ngay_tao: string;
  kich_hoat: boolean;
}

interface DanhMuc {
  id: string;
  ten_danh_muc: string;
  mo_ta: string;
  slug: string;
  ngay_tao: string;
  kich_hoat: boolean;
}

interface Podcast {
  id: string;
  tai_lieu_id: string;
  tieu_de: string;
  mo_ta: string;
  duong_dan_audio: string;
  thoi_luong_giay: number;
  hinh_anh_dai_dien: string;
  danh_muc_id: string;
  trang_thai: 'Bật' | 'Tắt';
  nguoi_tao: string;
  ngay_tao_ra: string;
  ngay_xuat_ban: string | null;
  the_tag: string;
  luot_xem: number;
  danhmuc: DanhMuc;
  // Optional properties for compatibility
  thumbnail?: string;
  title?: string;
  description?: string;
}

interface HeaderProps {
  user?: User;
  searchText: string;
  onSearchTextChange: (text: string) => void;
  onGoToFavorites: () => void;
  paddingTop: number;
}

interface QuickAccessSectionProps {
  recentPodcasts?: Podcast[];
  onPodcastPress: (podcast: Podcast) => void;
}

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
  showSeeAll?: boolean;
}

interface PodcastCardProps {
  item: Podcast;
  onPress: (podcast: Podcast) => void;
}

interface CategoriesGridProps {
  categories: DanhMuc[];
  onCategoryPress: (category: DanhMuc) => void;
  onShowAllCategories: () => void;
}

interface VerticalCardProps {
  item: Podcast;
  onPress: (podcast: Podcast) => void;
}

interface ModalCategoryItemProps {
  item: DanhMuc;
  onPress: (category: DanhMuc) => void;
}

interface EmptySearchProps {
  searchText: string;
}

// Get greeting based on time
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Chào buổi sáng';
  if (hour < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

// Header Component - Spotify style
export const Header: React.FC<HeaderProps> = ({ 
  user, 
  searchText, 
  onSearchTextChange, 
  onGoToFavorites, 
  paddingTop 
}) => {
  const greeting = getGreeting();
  
  return (
    <View style={[styles.headerContainer, { paddingTop: paddingTop + 8 }]}>
      {/* Top section with greeting and actions */}
      <View style={styles.headerTop}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>{greeting}</Text>
          {user && (
            <Text style={styles.userNameText}>
              {user.ho_ten || user.email}
            </Text>
          )}
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={onGoToFavorites}>
            <Ionicons name="heart" size={18} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="notifications-outline" size={18} color={colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="settings-outline" size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Ionicons 
            name="search" 
            size={20} 
            color={colors.textSecondary} 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm podcast, chương trình..."
            placeholderTextColor={colors.textSecondary}
            value={searchText}
            onChangeText={onSearchTextChange}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => onSearchTextChange('')}
            >
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Quick Access Cards (like Spotify's recently played)
export const QuickAccessSection: React.FC<QuickAccessSectionProps> = ({ 
  recentPodcasts, 
  onPodcastPress 
}) => {
  if (!recentPodcasts || recentPodcasts.length === 0) return null;
  
  return (
    <View style={styles.quickAccessContainer}>
      <View style={styles.quickAccessGrid}>
        {recentPodcasts.slice(0, 6).map((podcast) => (
          <TouchableOpacity
            key={podcast.id}
            style={styles.quickAccessCard}
            onPress={() => onPodcastPress(podcast)}
            activeOpacity={0.8}
          >
            <Image
              source={{ 
                uri: podcast.hinh_anh_dai_dien || 'https://via.placeholder.com/56x56/282828/1DB954?text=P'
              }}
              style={styles.quickAccessImage}
            />
            <Text style={styles.quickAccessText} numberOfLines={2}>
              {podcast.tieu_de}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Section Header Component
export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  onSeeAll, 
  showSeeAll = true 
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {showSeeAll && onSeeAll && (
      <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
        <Text style={styles.seeAllText}>Xem tất cả</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Enhanced Podcast Card with play button overlay
export const PodcastCard: React.FC<PodcastCardProps> = ({ item, onPress }) => {
  const [showPlayButton, setShowPlayButton] = useState(false);
  const scaleAnim = new Animated.Value(1);
  const playButtonAnim = new Animated.Value(0);

  const handlePressIn = () => {
    setShowPlayButton(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.spring(playButtonAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
      Animated.spring(playButtonAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 150,
        friction: 8,
      }),
    ]).start(() => setShowPlayButton(false));
  };

  return (
    <Animated.View style={[styles.podcastCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={styles.podcastImageContainer}>
          <Image
            source={{ 
              uri: item.thumbnail || item.hinh_anh_dai_dien || 'https://via.placeholder.com/140x140/282828/1DB954?text=P'
            }}
            style={styles.podcastImage}
          />
          
          {showPlayButton && (
            <Animated.View 
              style={[
                styles.playButtonOverlay,
                {
                  opacity: playButtonAnim,
                  transform: [
                    { scale: playButtonAnim },
                    { 
                      translateY: playButtonAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, 0],
                      })
                    }
                  ],
                }
              ]}
            >
              <Ionicons name="play" size={18} color={colors.text} />
            </Animated.View>
          )}
        </View>
        
        <Text style={styles.podcastTitle} numberOfLines={2}>
          {item.title || item.tieu_de}
        </Text>
        
        {(item.description || item.mo_ta) && (
          <Text style={styles.podcastArtist} numberOfLines={1}>
            {item.description || item.mo_ta}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Categories Grid with gradients
export const CategoriesGrid: React.FC<CategoriesGridProps> = ({ 
  categories, 
  onCategoryPress, 
  onShowAllCategories 
}) => {
  const displayCategories = categories.slice(0, 8);
  const rows: DanhMuc[][] = [];
  
  // Create rows of 2 categories each
  for (let i = 0; i < displayCategories.length; i += 2) {
    rows.push(displayCategories.slice(i, i + 2));
  }

  const getCategoryGradient = (index: number): readonly [ColorValue, ColorValue, ...ColorValue[]] => {
    return gradientColors[index % gradientColors.length];
  };

  return (
    <View style={styles.categoriesContainer}>
      <SectionHeader 
        title="Duyệt theo thể loại" 
        onSeeAll={onShowAllCategories}
      />
      
      <View style={styles.categoriesGrid}>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.categoryRow}>
            {row.map((category, index) => {
              const categoryIndex = rowIndex * 2 + index;
              const gradientColorPair = getCategoryGradient(categoryIndex);
              
              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.categoryCard}
                  onPress={() => onCategoryPress(category)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={gradientColorPair}
                    style={styles.categoryGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  
                  <Text style={styles.categoryTitle}>
                    {category.ten_danh_muc}
                  </Text>
                  
                  <View style={styles.categoryIcon}>
                    <Ionicons 
                      name="musical-notes" 
                      size={24} 
                      color="rgba(255, 255, 255, 0.6)" 
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

// Enhanced Vertical Card
export const VerticalCard: React.FC<VerticalCardProps> = ({ item, onPress }) => (
  <TouchableOpacity
    style={styles.verticalCard}
    onPress={() => onPress(item)}
    activeOpacity={0.7}
  >
    <Image
      source={{ 
        uri: item.hinh_anh_dai_dien || 'https://via.placeholder.com/56x56/282828/1DB954?text=P'
      }}
      style={styles.verticalImage}
    />
    
    <View style={styles.verticalContent}>
      <Text style={styles.verticalTitle} numberOfLines={1}>
        {item.tieu_de}
      </Text>
      <Text style={styles.verticalDesc} numberOfLines={1}>
        {item.mo_ta || 'Podcast'}
      </Text>
    </View>
    
    <TouchableOpacity style={styles.moreButton}>
      <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  </TouchableOpacity>
);

// Modal Category Item
export const ModalCategoryItem: React.FC<ModalCategoryItemProps> = ({ item, onPress }) => {
  const gradientColorPair = gradientColors[item.id.charCodeAt(0) % gradientColors.length];
  
  return (
    <TouchableOpacity
      style={styles.modalCategoryItem}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={gradientColorPair}
        style={styles.modalCategoryIcon}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name="musical-notes" size={20} color={colors.text} />
      </LinearGradient>
      
      <Text style={styles.modalCategoryText}>
        {item.ten_danh_muc}
      </Text>
    </TouchableOpacity>
  );
};

// Search Loading Component
export const SearchLoading: React.FC = () => (
  <View style={styles.searchLoadingContainer}>
    <Text style={styles.searchLoadingText}>Đang tìm kiếm...</Text>
  </View>
);

// Empty Search Component
export const EmptySearch: React.FC<EmptySearchProps> = ({ searchText }) => (
  <View style={styles.emptySearchContainer}>
    <Ionicons 
      name="search" 
      size={64} 
      color={colors.textMuted} 
      style={styles.emptySearchIcon}
    />
    <Text style={styles.emptySearchText}>
      Không tìm thấy kết quả
    </Text>
    <Text style={styles.emptySearchSubtext}>
      Hãy thử tìm kiếm với từ khóa khác cho "{searchText}"
    </Text>
  </View>
);

// Loading Screen Component
export const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Đang tải...</Text>
  </View>
);
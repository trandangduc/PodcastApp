import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Podcast, DanhMuc } from '../../types';
import podcastService from '../../services/api/podcastService';
import categoriesService from '../../services/api/categoriesService';
import debounce from 'lodash.debounce';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PodcastListProps {
  route?: {
    params?: {
      categoryId?: string;
      categoryName?: string;
    };
  };
}

interface SortOption {
  key: 'newest' | 'oldest' | 'most_viewed' | 'alphabetical' | 'duration_asc' | 'duration_desc';
  label: string;
  icon: string;
}

const sortOptions: SortOption[] = [
  { key: 'newest', label: 'Mới nhất', icon: 'time-outline' },
  { key: 'oldest', label: 'Cũ nhất', icon: 'time-reverse-outline' },
  { key: 'most_viewed', label: 'Lượt xem cao', icon: 'eye-outline' },
  { key: 'alphabetical', label: 'A-Z', icon: 'text-outline' },
  { key: 'duration_desc', label: 'Dài nhất', icon: 'timer-outline' },
  { key: 'duration_asc', label: 'Ngắn nhất', icon: 'hourglass-outline' },
];

const PodcastListScreen: React.FC<PodcastListProps> = ({ route }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const categoryId = route?.params?.categoryId;
  const categoryName = route?.params?.categoryName;

  // States
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  // Search & Filter states
  const [searchText, setSearchText] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedSort, setSelectedSort] = useState<SortOption>(sortOptions[0]);
  const [selectedCategory, setSelectedCategory] = useState<DanhMuc | null>(null);
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  
  // Modal states
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Animations
  const sortSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const filterSlideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Refs for preventing unnecessary re-renders
  const isLoadingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await categoriesService.getActiveCategories(100);
      if (mountedRef.current) {
        setCategories(categoriesData);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  const loadCategoryById = useCallback(async () => {
    if (!categoryId) return;
    try {
      const categoryResponse = await categoriesService.getCategoryById(categoryId);
      if (mountedRef.current) {
        setSelectedCategory(categoryResponse.data);
      }
    } catch (error) {
      console.error('Error loading category:', error);
    }
  }, [categoryId]);

  useEffect(() => {
    loadCategories();
    if (categoryId) {
      loadCategoryById();
    }
  }, [loadCategories, loadCategoryById, categoryId]);

  const loadPodcasts = useCallback(async (page: number = 1, isRefresh: boolean = false) => {
    // Prevent multiple concurrent loads
    if (isLoadingRef.current && !isRefresh) return;
    
    try {
      isLoadingRef.current = true;
      
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let response;
      
      if (searchActive && searchText.trim()) {
        // Search mode
        response = await podcastService.searchPodcasts({
          query: searchText.trim(),
          page,
          limit: 10,
          categoryId: selectedCategory?.id || categoryId,
        });
      } else {
        // Normal mode with filters
        response = await podcastService.getPodcasts({
          page,
          limit: 10,
          categoryId: selectedCategory?.id || categoryId,
          sort: selectedSort.key
        });
      }

      if (!mountedRef.current) return;

      if (isRefresh || page === 1) {
        setPodcasts(response.data);
      } else {
        setPodcasts(prev => [...prev, ...response.data]);
      }

      setCurrentPage(page);
      setTotalPages(response.pagination.total_pages);
      setHasMore(page < response.pagination.total_pages);

    } catch (error: any) {
      console.error('Error loading podcasts:', error);
      if (mountedRef.current) {
        Alert.alert('Lỗi', error.message || 'Không thể tải danh sách podcast');
      }
    } finally {
      isLoadingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        setSearchLoading(false);
      }
    }
  }, [searchActive, searchText, selectedSort, selectedCategory, categoryId]);

  // Create debounced search function outside of component render
  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (!mountedRef.current) return;
      
      if (text.trim() === '') {
        setSearchActive(false);
        setSearchLoading(false);
        loadPodcasts(1, true);
        return;
      }

      setSearchActive(true);
      setSearchLoading(true);
      setCurrentPage(1);
      setHasMore(true);
      loadPodcasts(1, true);
    }, 500),
    [loadPodcasts]
  );

  const onSearchTextChange = useCallback((text: string) => {
    setSearchText(text);
    if (text.trim() === '') {
      setSearchActive(false);
      loadPodcasts(1, true);
    } else {
      debouncedSearch(text);
    }
  }, [debouncedSearch, loadPodcasts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    setHasMore(true);
    loadPodcasts(1, true);
  }, [loadPodcasts]);

  const loadMore = useCallback(() => {
    if (hasMore && !loadingMore && !loading && currentPage < totalPages && !isLoadingRef.current) {
      loadPodcasts(currentPage + 1);
    }
  }, [hasMore, loadingMore, loading, currentPage, totalPages, loadPodcasts]);

  // Modal functions with better state management
  const showSortModal = useCallback(() => {
    setSortModalVisible(true);
    sortSlideAnim.setValue(SCREEN_HEIGHT);
    Animated.timing(sortSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [sortSlideAnim]);

  const hideSortModal = useCallback(() => {
    Animated.timing(sortSlideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (mountedRef.current) {
        setSortModalVisible(false);
      }
    });
  }, [sortSlideAnim]);

  const showFilterModal = useCallback(() => {
    setFilterModalVisible(true);
    filterSlideAnim.setValue(SCREEN_HEIGHT);
    Animated.timing(filterSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [filterSlideAnim]);

  const hideFilterModal = useCallback(() => {
    Animated.timing(filterSlideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (mountedRef.current) {
        setFilterModalVisible(false);
      }
    });
  }, [filterSlideAnim]);

  const handleSortSelect = useCallback((option: SortOption) => {
    setSelectedSort(option);
    setCurrentPage(1);
    setHasMore(true);
    hideSortModal();
  }, [hideSortModal]);

  const handleCategorySelect = useCallback((category: DanhMuc | null) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setHasMore(true);
    hideFilterModal();
  }, [hideFilterModal]);

  const clearAllFilters = useCallback(() => {
    setSelectedCategory(null);
    setSelectedSort(sortOptions[0]);
    setSearchText('');
    setSearchActive(false);
    setCurrentPage(1);
    setHasMore(true);
    hideFilterModal();
  }, [hideFilterModal]);

  // Load podcasts when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPodcasts(1, true);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [selectedSort, selectedCategory]);

  // Format functions
  const formatDuration = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  const formatViews = useCallback((views: number): string => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  }, []);

  const formatDate = useCallback((dateString: string): string => {
    if (!dateString || dateString === '0001-01-01T00:00:00Z') {
      return 'Chưa xác định';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const handlePodcastPress = useCallback((podcast: Podcast) => {
    navigation.navigate('PodcastDetail', { podcastId: podcast.id });
  }, [navigation]);

  const renderPodcastItem = useCallback(({ item }: { item: Podcast }) => (
    <TouchableOpacity 
      style={styles.podcastItem} 
      onPress={() => handlePodcastPress(item)}
    >
      <Image 
        source={{ 
          uri: item.hinh_anh_dai_dien || 'https://via.placeholder.com/80x80/1e1e1e/4CAF50?text=No+Image' 
        }} 
        style={styles.thumbnail}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>{item.tieu_de}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.mo_ta}</Text>
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color="#4CAF50" />
            <Text style={styles.metaText}>{formatDuration(item.thoi_luong_giay)}</Text>
            <Ionicons name="eye-outline" size={14} color="#4CAF50" style={{ marginLeft: 12 }} />
            <Text style={styles.metaText}>{formatViews(item.luot_xem)}</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: item.trang_thai === 'Bật' ? '#4CAF50' : '#ff4444' }
            ]}>
              <Text style={styles.statusText}>{item.trang_thai}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(item.ngay_tao_ra)}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play-circle-outline" size={32} color="#4CAF50" />
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handlePodcastPress, formatDuration, formatViews, formatDate]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.loadingText}>Đang tải thêm...</Text>
      </View>
    );
  }, [loadingMore]);

  const renderHeader = useCallback(() => (
    <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {categoryName ? `${categoryName}` : 'Tất cả Podcast'}
      </Text>

    </View>
  ), [insets.top, navigation, categoryName]);

  const renderSearchAndFilters = useCallback(() => (
    <View style={styles.searchFilterContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#aaa" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm podcast..."
          placeholderTextColor="#aaa"
          value={searchText}
          onChangeText={onSearchTextChange}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => onSearchTextChange('')}>
            <Ionicons name="close-circle" size={20} color="#aaa" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterButtonsContainer}>
        <TouchableOpacity style={styles.filterButton} onPress={showSortModal}>
          <Ionicons name="swap-vertical-outline" size={16} color="#4CAF50" />
          <Text style={styles.filterButtonText}>{selectedSort.label}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterButton} onPress={showFilterModal}>
          <Ionicons name="funnel-outline" size={16} color="#4CAF50" />
          <Text style={styles.filterButtonText}>
            {selectedCategory ? selectedCategory.ten_danh_muc : 'Danh mục'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {(selectedCategory || searchActive) && (
        <View style={styles.activeFiltersContainer}>
          {searchActive && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>"{searchText}"</Text>
              <TouchableOpacity onPress={() => onSearchTextChange('')}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {selectedCategory && !categoryId && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>{selectedCategory.ten_danh_muc}</Text>
              <TouchableOpacity onPress={() => handleCategorySelect(null)}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Search Loading */}
      {searchLoading && (
        <View style={styles.searchLoadingContainer}>
          <ActivityIndicator size="small" color="#4CAF50" />
          <Text style={styles.searchLoadingText}>Đang tìm kiếm...</Text>
        </View>
      )}
    </View>
  ), [searchText, onSearchTextChange, showSortModal, selectedSort.label, showFilterModal, selectedCategory, searchActive, categoryId, handleCategorySelect, searchLoading]);

  const renderSortModal = useCallback(() => (
    <Modal
      visible={sortModalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={hideSortModal}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackground} onPress={hideSortModal} />
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: sortSlideAnim }] }
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sắp xếp theo</Text>
          </View>
          <FlatList
            data={sortOptions}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedSort.key === item.key && styles.selectedModalItem
                ]}
                onPress={() => handleSortSelect(item)}
              >
                <Ionicons name={item.icon as any} size={20} color="#4CAF50" />
                <Text style={styles.modalItemText}>{item.label}</Text>
                {selectedSort.key === item.key && (
                  <Ionicons name="checkmark" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </View>
    </Modal>
  ), [sortModalVisible, hideSortModal, sortSlideAnim, selectedSort.key, handleSortSelect]);

  const renderFilterModal = useCallback(() => (
    <Modal
      visible={filterModalVisible}
      transparent={true}
      animationType="none"
      onRequestClose={hideFilterModal}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackground} onPress={hideFilterModal} />
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: filterSlideAnim }] }
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Lọc theo danh mục</Text>
            <TouchableOpacity onPress={clearAllFilters}>
              <Text style={styles.clearButton}>Xóa tất cả</Text>
            </TouchableOpacity>
          </View>
          
          {/* All Categories Option */}
          <TouchableOpacity
            style={[
              styles.modalItem,
              !selectedCategory && styles.selectedModalItem
            ]}
            onPress={() => handleCategorySelect(null)}
          >
            <Ionicons name="apps-outline" size={20} color="#4CAF50" />
            <Text style={styles.modalItemText}>Tất cả danh mục</Text>
            {!selectedCategory && (
              <Ionicons name="checkmark" size={20} color="#4CAF50" />
            )}
          </TouchableOpacity>

          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedCategory?.id === item.id && styles.selectedModalItem
                ]}
                onPress={() => handleCategorySelect(item)}
              >
                <Ionicons name="folder-outline" size={20} color="#4CAF50" />
                <Text style={styles.modalItemText}>{item.ten_danh_muc}</Text>
                {selectedCategory?.id === item.id && (
                  <Ionicons name="checkmark" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </View>
    </Modal>
  ), [filterModalVisible, hideFilterModal, filterSlideAnim, clearAllFilters, selectedCategory, handleCategorySelect, categories]);

  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Ionicons name="musical-notes-outline" size={80} color="#666" />
      <Text style={styles.emptyTitle}>
        {searchActive ? 'Không tìm thấy kết quả' : 'Không có podcast nào'}
      </Text>
      <Text style={styles.emptyDescription}>
        {searchActive 
          ? `Không tìm thấy podcast nào với từ khóa "${searchText}"`
          : categoryName 
            ? `Chưa có podcast nào trong danh mục "${categoryName}"`
            : 'Chưa có podcast nào được tạo'
        }
      </Text>
    </View>
  ), [searchActive, searchText, categoryName]);

  if (loading && currentPage === 1) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        {renderSearchAndFilters()}
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải podcast...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderSearchAndFilters()}
      <FlatList
        data={podcasts}
        keyExtractor={(item) => item.id}
        renderItem={renderPodcastItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#4CAF50"
            colors={['#4CAF50']}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmptyState : null}
        contentContainerStyle={[
          styles.listContainer,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      />
      {renderSortModal()}
      {renderFilterModal()}
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  searchFilterContainer: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#fff',
    fontSize: 14,
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  activeFilterText: {
    color: '#fff',
    fontSize: 12,
  },
  searchLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  searchLoadingText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#aaa',
    marginTop: 10,
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  podcastItem: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  thumbnail: {
    width: 80,
    height: 80,
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
  description: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  metaContainer: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  dateText: {
    color: '#aaa',
    fontSize: 10,
  },
  playButton: {
    padding: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
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
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalBackground: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
    minHeight: SCREEN_HEIGHT * 0.3,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    position: 'absolute',
    top: 8,
    left: '50%',
    marginLeft: -20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginTop: 12,
  },
  clearButton: {
    color: '#4CAF50',
    fontSize: 14,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    gap: 12,
  },
  selectedModalItem: {
    backgroundColor: '#2a2a2a',
  },
  modalItemText: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
});

export default PodcastListScreen;
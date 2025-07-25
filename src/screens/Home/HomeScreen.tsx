import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
  Modal,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import podcastService from '../../services/api/podcastService';
import categoriesService from '../../services/api/categoriesService';
import debounce from 'lodash.debounce';
import { Podcast, DanhMuc, User } from '../../types/index';
// Import new Spotify-style components and styles
import { 
  homeStyles as styles, 
  colors,
  ITEM_HEIGHT, 
  WINDOW_SIZE, 
  INITIAL_NUM_TO_RENDER 
} from '../../styles/homeStyles';
import {
  Header,
  QuickAccessSection,
  SectionHeader,
  PodcastCard,
  VerticalCard,
  CategoriesGrid,
  ModalCategoryItem,
  SearchLoading,
  EmptySearch,
  LoadingScreen,
} from '../../components/HomeComponents';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Cache configuration
const CACHE_KEYS = {
  FEATURED_PODCASTS: 'home_featured_podcasts',
  RECENT_PODCASTS: 'home_recent_podcasts', 
  RECOMMENDED_PODCASTS: 'home_recommended_podcasts',
  CATEGORIES: 'home_categories',
  CACHE_TIMESTAMP: 'home_cache_timestamp',
  DATA_LOADED: 'home_data_loaded'
};

const CACHE_DURATION = 30 * 60 * 1000; // 30 phút

// Interface cho featured podcasts với các thuộc tính bổ sung để hiển thị
interface FeaturedPodcast extends Podcast {
  thumbnail?: string;
  title?: string;
  description?: string;
}

// Cache utilities
const saveToCache = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
    await AsyncStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};

const getFromCache = async (key: string) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading from cache:', error);
    return null;
  }
};

const isCacheValid = async () => {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
    if (!timestamp) return false;
    
    const cacheAge = Date.now() - parseInt(timestamp);
    return cacheAge < CACHE_DURATION;
  } catch (error) {
    return false;
  }
};

const clearCache = async () => {
  try {
    const keys = Object.values(CACHE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const { user, isAuthenticated, logout } = useAuth();

  // States
  const [searchText, setSearchText] = useState('');
  const [featuredPodcasts, setFeaturedPodcasts] = useState<FeaturedPodcast[]>([]);
  const [recentPodcasts, setRecentPodcasts] = useState<Podcast[]>([]);
  const [recommendedPodcasts, setRecommendedPodcasts] = useState<Podcast[]>([]);
  const [categories, setCategories] = useState<DanhMuc[]>([]);
  const [searchResults, setSearchResults] = useState<Podcast[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Animation for modal
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  
  // Track if this is the first time loading data
  const isFirstLoad = useRef(true);

  // Load home data with caching logic
  useEffect(() => {
    if (isAuthenticated) {
      // Chỉ load khi lần đầu vào app hoặc khi focus lại và chưa có dữ liệu
      if (isFirstLoad.current || (isFocused && !dataLoaded)) {
        loadHomeData();
        isFirstLoad.current = false;
      }
    }
  }, [isAuthenticated, isFocused, dataLoaded]);

  const loadCachedData = async () => {
    try {
      const [cachedFeatured, cachedRecent, cachedRecommended, cachedCategories] = await Promise.all([
        getFromCache(CACHE_KEYS.FEATURED_PODCASTS),
        getFromCache(CACHE_KEYS.RECENT_PODCASTS),
        getFromCache(CACHE_KEYS.RECOMMENDED_PODCASTS),
        getFromCache(CACHE_KEYS.CATEGORIES)
      ]);

      if (cachedFeatured && cachedRecent && cachedRecommended && cachedCategories) {
        setFeaturedPodcasts(cachedFeatured);
        setRecentPodcasts(cachedRecent);
        setRecommendedPodcasts(cachedRecommended);
        setCategories(cachedCategories);
        setDataLoaded(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading cached data:', error);
      return false;
    }
  };

  const loadHomeData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      
      // Kiểm tra cache nếu không force refresh
      if (!forceRefresh && await isCacheValid()) {
        const cacheLoaded = await loadCachedData();
        if (cacheLoaded) {
          setLoading(false);
          return;
        }
      }
      
      // Nếu cache không hợp lệ hoặc force refresh, load từ API
      console.log('Loading fresh data from API...');
      
      // Load tất cả API song song để tăng tốc
      const [popularResponse, recentResponse, recommendedResponse, categoriesData] = await Promise.all([
        podcastService.getPopularPodcasts(1, 6),
        podcastService.getPopularPodcasts(1, 6), // Có thể thay bằng API khác cho recent
        podcastService.getRecommendedPodcasts(1, 20),
        categoriesService.getActiveCategories(50)
      ]);

      // Process featured podcasts
      const featured = popularResponse.data.map((podcast): FeaturedPodcast => ({
        ...podcast,
        thumbnail: podcast.hinh_anh_dai_dien || 'https://via.placeholder.com/140x140/282828/1DB954?text=P',
        title: podcast.tieu_de,
        description: podcast.mo_ta,
      }));

      // Update states
      setFeaturedPodcasts(featured);
      setRecentPodcasts(recentResponse.data);
      setRecommendedPodcasts(recommendedResponse.data);
      setCategories(categoriesData);
      setDataLoaded(true);

      // Save to cache
      await Promise.all([
        saveToCache(CACHE_KEYS.FEATURED_PODCASTS, featured),
        saveToCache(CACHE_KEYS.RECENT_PODCASTS, recentResponse.data),
        saveToCache(CACHE_KEYS.RECOMMENDED_PODCASTS, recommendedResponse.data),
        saveToCache(CACHE_KEYS.CATEGORIES, categoriesData)
      ]);

      console.log('Data cached successfully');
   
    } catch (error) {
      console.error('HomeScreen: Error loading home data:', error);
      
      // Fallback to cache if API fails
      const cacheLoaded = await loadCachedData();
      if (!cacheLoaded) {
        // Reset states if no cache available
        setFeaturedPodcasts([]);
        setRecentPodcasts([]);
        setRecommendedPodcasts([]);
        setCategories([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh - force reload
  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setRefreshing(true);
    await loadHomeData(true); // Force refresh
    setRefreshing(false);
  }, [isAuthenticated]);

  // Clear cache when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      clearCache();
      setDataLoaded(false);
      isFirstLoad.current = true;
    }
  }, [isAuthenticated]);

  // Search function
  const performSearch = useCallback(
    debounce(async (text: string) => {
      if (!isAuthenticated) return;
      
      if (text.trim() === '') {
        setSearchResults([]);
        setSearching(false);
        return;
      }
      
      try {
        setSearchLoading(true);
        setSearching(true);
        
        const response = await podcastService.searchPodcasts({
          query: text.trim(),
          page: 1,
          limit: 20
        });
        
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching podcasts:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    [isAuthenticated]
  );

  const onSearchTextChange = useCallback((text: string) => {
    setSearchText(text);
    performSearch(text);
  }, [performSearch]);

  // Navigation handlers
  const handlePodcastPress = useCallback((item: Podcast | FeaturedPodcast) => {
    navigation.navigate('PodcastDetail', { podcastId: item.id });
  }, [navigation]);

  const handleQuickAccessPodcastPress = useCallback((podcast: Podcast) => {
    handlePodcastPress(podcast);
  }, [handlePodcastPress]);

  const handleFeaturedPodcastPress = useCallback((item: FeaturedPodcast) => {
    handlePodcastPress(item);
  }, [handlePodcastPress]);

  const handleCategoryPress = useCallback((category: DanhMuc) => {
    hideModal();
    setTimeout(() => {
      navigation.navigate('PodcastList', { 
        categoryId: category.id, 
        categoryName: category.ten_danh_muc 
      });
    }, 100);
  }, [navigation]);

  const handleSeeAllPodcasts = useCallback(() => {
    navigation.navigate('PodcastList');
  }, [navigation]);

  const handleGoToFavorites = useCallback(() => {
    navigation.navigate('Favorites');
  }, [navigation]);

  // Modal handlers
  const handleShowAllCategories = useCallback(() => {
    setModalVisible(true);
    slideAnim.setValue(SCREEN_HEIGHT);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [slideAnim]);

  const hideModal = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: SCREEN_HEIGHT,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start(() => {
      setModalVisible(false);
    });
  }, [slideAnim]);

  // Render functions
  const renderPodcastCard = useCallback(({ item }: { item: FeaturedPodcast }) => (
    <PodcastCard item={item} onPress={handleFeaturedPodcastPress} />
  ), [handleFeaturedPodcastPress]);

  const renderVerticalCard = useCallback(({ item }: { item: Podcast }) => (
    <VerticalCard item={item} onPress={handlePodcastPress} />
  ), [handlePodcastPress]);

  const renderModalCategoryItem = useCallback(({ item }: { item: DanhMuc }) => (
    <ModalCategoryItem item={item} onPress={handleCategoryPress} />
  ), [handleCategoryPress]);

  // Performance optimizations
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  const keyExtractor = useCallback((item: Podcast) => item.id, []);

  // Data for main FlatList
  const flatListData: Podcast[] = searching ? searchResults : recommendedPodcasts;

  // List Header Component
  const listHeaderComponent = useMemo(() => {
    if (searching) {
      return (
        <View>
          <SectionHeader title={`Kết quả cho "${searchText}"`} showSeeAll={false} />
          {searchLoading && <SearchLoading />}
        </View>
      );
    }
    return (
      <>
        {/* Quick Access Section - like Spotify's recent items */}
        <QuickAccessSection 
          recentPodcasts={recentPodcasts}
          onPodcastPress={handleQuickAccessPodcastPress}
        />
        {/* Featured Podcasts */}
        <SectionHeader title="Nổi bật hôm nay" onSeeAll={handleSeeAllPodcasts} />
        <FlatList
          data={featuredPodcasts}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={renderPodcastCard}
          contentContainerStyle={styles.horizontalListContent}
          showsHorizontalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={4}
          windowSize={5}
        />
        {/* Categories Grid */}
        <CategoriesGrid 
          categories={categories}
          onCategoryPress={handleCategoryPress}
          onShowAllCategories={handleShowAllCategories}
        />
        {/* Recommended Section */}
        <SectionHeader title="Đề xuất cho bạn" showSeeAll={false} />
      </>
    );
  }, [
    searching, 
    searchText, 
    searchLoading, 
    recentPodcasts,
    featuredPodcasts, 
    categories,
    renderPodcastCard,
    handleQuickAccessPodcastPress,
    handleCategoryPress,
    handleShowAllCategories,
    handleSeeAllPodcasts
  ]);

  // List Empty Component
  const listEmptyComponent = useMemo(() => {
    if (searching && !searchLoading) {
      return <EmptySearch searchText={searchText} />;
    }
    return null;
  }, [searching, searchLoading, searchText]);

  // Show loading screen if not authenticated
  if (!isAuthenticated) {
    return <LoadingScreen />;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.flex} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar backgroundColor={colors.background} barStyle="light-content" />
          
          {/* Header with Spotify-style greeting and search */}
          <Header
            user={user as User}
            searchText={searchText}
            onSearchTextChange={onSearchTextChange}
            onGoToFavorites={handleGoToFavorites}
            paddingTop={insets.top}
          />

          {/* Main Content */}
          <FlatList<Podcast>
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
                colors={[colors.primary]}
                progressBackgroundColor={colors.surface}
              />
            }
            ListHeaderComponent={listHeaderComponent}
            data={flatListData}
            keyExtractor={keyExtractor}
            renderItem={renderVerticalCard}
            contentContainerStyle={styles.mainListContent}
            ListEmptyComponent={listEmptyComponent}
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={INITIAL_NUM_TO_RENDER}
            updateCellsBatchingPeriod={50}
            initialNumToRender={INITIAL_NUM_TO_RENDER}
            windowSize={WINDOW_SIZE}
            getItemLayout={getItemLayout}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 100,
            }}
            legacyImplementation={false}
          />

          {/* Enhanced Modal for Categories */}
          <Modal
            visible={modalVisible}
            transparent={true}
            animationType="none"
            onRequestClose={hideModal}
            statusBarTranslucent={true}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={hideModal}>
                <View style={styles.modalBackground} />
              </TouchableWithoutFeedback>
              
              <Animated.View 
                style={[
                  styles.modalContent,
                  {
                    transform: [{ translateY: slideAnim }],
                    paddingBottom: insets.bottom + 20,
                  }
                ]}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHandle} />
                  <Text style={styles.modalTitle}>Tất cả thể loại</Text>
                </View>
                
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item.id}
                  renderItem={renderModalCategoryItem}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.modalList}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={10}
                  windowSize={10}
                />
              </Animated.View>
            </View>
          </Modal>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;
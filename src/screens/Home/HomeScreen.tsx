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

// Interface cho featured podcasts với các thuộc tính bổ sung để hiển thị
interface FeaturedPodcast extends Podcast {
  thumbnail?: string;
  title?: string;
  description?: string;
}

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
  
  // Animation for modal
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Load home data
  useEffect(() => {
    if (isAuthenticated && isFocused) {
      loadHomeData();
    }
  }, [isAuthenticated, isFocused]);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load featured podcasts
      const popularResponse = await podcastService.getPopularPodcasts(1, 6);
      const featured = popularResponse.data.map((podcast): FeaturedPodcast => ({
        ...podcast, // Spread all properties from original podcast
        thumbnail: podcast.hinh_anh_dai_dien || 'https://via.placeholder.com/140x140/282828/1DB954?text=P',
        title: podcast.tieu_de, // Map tieu_de to title for compatibility
        description: podcast.mo_ta,
      }));
      setFeaturedPodcasts(featured);

      // Load recent podcasts for quick access
      const recentResponse = await podcastService.getPopularPodcasts(1, 6);
      setRecentPodcasts(recentResponse.data);

      // Load recommended podcasts
      const recommendedResponse = await podcastService.getRecommendedPodcasts(1, 20);
      setRecommendedPodcasts(recommendedResponse.data);

      // Load categories
      const categoriesData = await categoriesService.getActiveCategories(50);
      setCategories(categoriesData);
   
    } catch (error) {
      console.error('HomeScreen: Error loading home data:', error);
      setFeaturedPodcasts([]);
      setRecentPodcasts([]);
      setRecommendedPodcasts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
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

  // Fix: Tạo wrapper function cho QuickAccessSection
  const handleQuickAccessPodcastPress = useCallback((podcast: Podcast) => {
    handlePodcastPress(podcast);
  }, [handlePodcastPress]);

  // Fix: Tạo wrapper function cho Featured Podcasts
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
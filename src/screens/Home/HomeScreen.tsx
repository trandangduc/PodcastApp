import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  RefreshControl,
  Modal,
  Animated,
  Dimensions,
  DimensionValue 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import authService from '../../services/api/authService';
import podcastService from '../../services/api/podcastService';
import categoriesService from '../../services/api/categoriesService';
import debounce from 'lodash.debounce';
import { Podcast, DanhMuc } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive dimensions
const isTablet = SCREEN_WIDTH >= 768;
const cardWidth = isTablet ? (SCREEN_WIDTH - 48) / 3 : 140;
const categoriesPerRow = isTablet ? 3 : 2;
const categoryCardWidth: DimensionValue = `${100 / categoriesPerRow - 2}%`;

// Performance constants
const ITEM_HEIGHT = isTablet ? 110 : 92; // Estimated height for getItemLayout
const WINDOW_SIZE = 10;
const INITIAL_NUM_TO_RENDER = 8;

// Định nghĩa interfaces cho featured podcasts display
interface FeaturedPodcast {
  id: string;
  title: string;
  thumbnail: string;
  description?: string;
}

// Union type để handle cả 2 loại data
type PodcastItem = FeaturedPodcast | Podcast;

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();

  // States
  const [user, setUser] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [featuredPodcasts, setFeaturedPodcasts] = useState<FeaturedPodcast[]>([]);
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

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await authService.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    if (isFocused) loadUserData();
  }, [isFocused]);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      
      // Load featured podcasts (popular ones)
      const popularResponse = await podcastService.getPopularPodcasts(1, 6);
      const featured = popularResponse.data.map((podcast): FeaturedPodcast => ({
        id: podcast.id,
        title: podcast.tieu_de,
        thumbnail: podcast.hinh_anh_dai_dien || 'https://via.placeholder.com/140x140/1e1e1e/4CAF50?text=No+Image',
        description: podcast.mo_ta
      }));
      setFeaturedPodcasts(featured);

      // Load recommended podcasts
      const recommendedResponse = await podcastService.getRecommendedPodcasts(1, 5);
      setRecommendedPodcasts(recommendedResponse.data);

      // Load categories từ API
      const categoriesData = await categoriesService.getActiveCategories(50);
      setCategories(categoriesData);

    } catch (error) {
      console.error('Error loading home data:', error);
      setFeaturedPodcasts([]);
      setRecommendedPodcasts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh - optimized
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  }, []);

  // Search function gọi API thật - optimized
  const performSearch = useCallback(
    debounce(async (text: string) => {
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
        Alert.alert('Lỗi', 'Không thể tìm kiếm podcast. Vui lòng thử lại.');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    []
  );

  const onSearchTextChange = useCallback((text: string) => {
    setSearchText(text);
    performSearch(text);
  }, [performSearch]);

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất', 
        style: 'destructive', 
        onPress: async () => {
          await authService.logout();
          authService.removeAuthHeader();
        },
      },
    ]);
  };

  const handlePodcastPress = useCallback((item: PodcastItem) => {
    navigation.navigate('PodcastDetail', { podcastId: item.id });
  }, [navigation]);

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

  const handleShowAllCategories = useCallback(() => {
    setModalVisible(true);
    slideAnim.setValue(SCREEN_HEIGHT);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  const hideModal = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  }, [slideAnim]);

  // Memoized render functions for performance
  const renderHeader = useMemo(() => (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>      
      <View style={styles.welcomeRow}>
        <View>
          <Text style={styles.welcomeText}>
            Xin chào, <Text style={styles.bold}>{user?.ho_ten || 'Người dùng'}</Text>
          </Text>
          <Text style={styles.roleText}>
            {user?.vai_tro === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          </Text>
        </View>
        <TouchableOpacity style={styles.favoriteButton} onPress={handleGoToFavorites}>
          <Ionicons name="heart-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          placeholder="Tìm kiếm podcast..."
          placeholderTextColor="#aaa"
          style={styles.searchInput}
          value={searchText}
          onChangeText={onSearchTextChange}
        />
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  ), [insets.top, user, searchText, onSearchTextChange, handleGoToFavorites]);

  const renderPodcastCard = useCallback(({ item }: { item: FeaturedPodcast }) => (
    <TouchableOpacity 
      style={[styles.podcastCard, { width: cardWidth }]} 
      onPress={() => handlePodcastPress(item)}
    >
      <Image 
        source={{ uri: item.thumbnail }} 
        style={styles.podcastImage}
        resizeMode="cover"
      />
      <Text style={styles.podcastTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  ), [handlePodcastPress]);

  const renderVerticalCard = useCallback(({ item }: { item: Podcast }) => (
    <TouchableOpacity 
      style={styles.verticalCard} 
      onPress={() => handlePodcastPress(item)}
    >
      <Image 
        source={{ 
          uri: item.hinh_anh_dai_dien || 'https://via.placeholder.com/60x60/1e1e1e/4CAF50?text=No+Image' 
        }} 
        style={styles.verticalImage}
        resizeMode="cover"
      />
      <View style={styles.verticalContent}>
        <Text style={styles.verticalTitle} numberOfLines={2}>{item.tieu_de}</Text>
        <Text style={styles.verticalDesc} numberOfLines={2}>{item.mo_ta || ''}</Text>
      </View>
      <Ionicons name="play-circle-outline" size={26} color="#4CAF50" />
    </TouchableOpacity>
  ), [handlePodcastPress]);

  const renderSectionHeader = useCallback((title: string, onSeeAll?: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAllText}>Xem tất cả</Text>
        </TouchableOpacity>
      )}
    </View>
  ), []);

  // Render categories section với "Xem thêm" - memoized
  const renderCategoriesSection = useMemo(() => {
    const displayCategories = categories.slice(0, categoriesPerRow * 2);
    
    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh mục</Text>
          {categories.length > displayCategories.length && (
            <TouchableOpacity onPress={handleShowAllCategories}>
              <Text style={styles.seeAllText}>Xem thêm</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.categoriesGrid}>
          {displayCategories.map((category) => (
            <TouchableOpacity 
              key={category.id}
              style={[styles.mainCategoryCard, { width: categoryCardWidth }]} 
              onPress={() => handleCategoryPress(category)}
            >
              <View style={styles.categoryIconContainer}>
                <Ionicons name="folder-outline" size={isTablet ? 28 : 24} color="#4CAF50" />
              </View>
              <Text style={styles.mainCategoryText} numberOfLines={2}>{category.ten_danh_muc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }, [categories, handleShowAllCategories, handleCategoryPress]);

  // Render modal category item
  const renderModalCategoryItem = useCallback(({ item }: { item: DanhMuc }) => (
    <TouchableOpacity 
      style={styles.modalCategoryItem} 
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.modalCategoryIcon}>
        <Ionicons name="folder-outline" size={20} color="#4CAF50" />
      </View>
      <Text style={styles.modalCategoryText}>{item.ten_danh_muc}</Text>
      <Ionicons name="chevron-forward" size={16} color="#666" />
    </TouchableOpacity>
  ), [handleCategoryPress]);

  // Data for main FlatList
  const flatListData: Podcast[] = searching ? searchResults : recommendedPodcasts;

  // getItemLayout for performance
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  // keyExtractor
  const keyExtractor = useCallback((item: Podcast) => item.id, []);

  // ListHeaderComponent memoized
  const listHeaderComponent = useMemo(() => {
    if (searching) {
      return (
        <View>
          {renderSectionHeader(`Kết quả tìm kiếm "${searchText}"`)}
          {searchLoading && (
            <View style={styles.searchLoadingContainer}>
              <Text style={styles.searchLoadingText}>Đang tìm kiếm...</Text>
            </View>
          )}
        </View>
      );
    }

    return (
      <>
        {renderSectionHeader('Podcast nổi bật', handleSeeAllPodcasts)}
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
        {renderCategoriesSection}
        {renderSectionHeader('Gợi ý hôm nay')}
      </>
    );
  }, [searching, searchText, searchLoading, featuredPodcasts, renderCategoriesSection, renderSectionHeader, renderPodcastCard, handleSeeAllPodcasts]);

  // ListEmptyComponent memoized
  const listEmptyComponent = useMemo(() => {
    if (searching && !searchLoading) {
      return (
        <View style={styles.emptySearchContainer}>
          <Ionicons name="search-outline" size={60} color="#666" />
          <Text style={styles.emptySearchText}>Không tìm thấy kết quả nào</Text>
          <Text style={styles.emptySearchSubtext}>Thử tìm kiếm với từ khóa khác</Text>
        </View>
      );
    }
    return null;
  }, [searching, searchLoading]);

  return (
    <KeyboardAvoidingView 
      style={styles.flex} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar backgroundColor="#1a1a1a" barStyle="light-content" />
          {renderHeader}
          <FlatList<Podcast>
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4CAF50"
                colors={['#4CAF50']}
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

          {/* Modal for Categories */}
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
                    maxHeight: SCREEN_HEIGHT * 0.8,
                    minHeight: SCREEN_HEIGHT * 0.5,
                  }
                ]}
              >
                <View style={styles.modalHeader}>
                  <View style={styles.modalHandle} />
                  <View style={styles.modalTitleContainer}>
                    <Text style={styles.modalTitle}>Tất cả danh mục</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={hideModal}>
                      <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
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

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { 
    flex: 1, 
    backgroundColor: '#121212' 
  },
  headerContainer: { 
    paddingHorizontal: 16, 
    marginBottom: 12 
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeText: { 
    color: '#fff', 
    fontSize: isTablet ? 17 : 15 
  },
  roleText: { 
    color: '#4CAF50', 
    fontSize: isTablet ? 15 : 13 
  },
  bold: { 
    fontWeight: 'bold' 
  },
  favoriteButton: {
    padding: 8,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
  },
  searchRow: { 
    flexDirection: 'row', 
    backgroundColor: '#1f1f1f', 
    borderRadius: 10, 
    alignItems: 'center', 
    paddingHorizontal: 10 
  },
  searchInput: { 
    flex: 1, 
    height: isTablet ? 45 : 40, 
    color: '#fff', 
    fontSize: isTablet ? 16 : 14 
  },
  iconButton: { 
    paddingLeft: 8 
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 16,
  },
  sectionTitle: { 
    color: '#fff', 
    fontSize: isTablet ? 18 : 15, 
    fontWeight: 'bold' 
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: isTablet ? 16 : 14,
  },
  horizontalListContent: { 
    paddingHorizontal: 16 
  },
  podcastCard: { 
    marginRight: 14,
  },
  podcastImage: { 
    width: '100%', 
    height: isTablet ? 180 : 140, 
    borderRadius: 12, 
    marginBottom: 6 
  },
  podcastTitle: { 
    color: '#fff', 
    fontSize: isTablet ? 16 : 14 
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  mainCategoryCard: {
    backgroundColor: '#1f1f1f',
    marginBottom: 12,
    paddingVertical: isTablet ? 25 : 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: isTablet ? 120 : 100,
  },
  categoryIconContainer: {
    width: isTablet ? 45 : 40,
    height: isTablet ? 45 : 40,
    borderRadius: isTablet ? 22.5 : 20,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  mainCategoryText: {
    color: '#fff',
    fontSize: isTablet ? 15 : 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  verticalCard: { 
    flexDirection: 'row', 
    backgroundColor: '#1e1e1e', 
    marginBottom: 12, 
    borderRadius: 10, 
    padding: isTablet ? 15 : 10, 
    alignItems: 'center',
    minHeight: ITEM_HEIGHT,
  },
  verticalImage: { 
    width: isTablet ? 80 : 60, 
    height: isTablet ? 80 : 60, 
    borderRadius: 8 
  },
  verticalContent: { 
    flex: 1, 
    paddingLeft: 10 
  },
  verticalTitle: { 
    color: '#fff', 
    fontSize: isTablet ? 16 : 14, 
    fontWeight: 'bold' 
  },
  verticalDesc: { 
    color: '#ccc', 
    fontSize: isTablet ? 14 : 12, 
    marginTop: 4 
  },
  mainListContent: { 
    paddingBottom: 100, 
    paddingHorizontal: 16 
  },
  searchLoadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  searchLoadingText: {
    color: '#4CAF50',
    fontSize: isTablet ? 16 : 14,
  },
  emptySearchContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptySearchText: {
    color: '#fff',
    fontSize: isTablet ? 18 : 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySearchSubtext: {
    color: '#aaa',
    fontSize: isTablet ? 16 : 14,
    marginTop: 8,
  },
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
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#fff',
    fontSize: isTablet ? 20 : 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
  },
  modalList: {
    padding: 16,
  },
  modalCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    padding: isTablet ? 20 : 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalCategoryIcon: {
    width: isTablet ? 36 : 32,
    height: isTablet ? 36 : 32,
    borderRadius: isTablet ? 18 : 16,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  modalCategoryText: {
    flex: 1,
    color: '#fff',
    fontSize: isTablet ? 16 : 14,
    fontWeight: '500',
  },
});

export default HomeScreen;
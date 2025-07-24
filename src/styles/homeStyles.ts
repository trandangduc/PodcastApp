import { StyleSheet, Dimensions, ColorValue } from 'react-native';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive dimensions
export const isTablet = SCREEN_WIDTH >= 768;
export const cardWidth = isTablet ? (SCREEN_WIDTH - 48) / 3 : 140;
export const categoriesPerRow = isTablet ? 3 : 2;
export const categoryCardWidth = `${100 / categoriesPerRow - 2}%` as const;

// Performance constants
export const ITEM_HEIGHT = isTablet ? 110 : 92;
export const WINDOW_SIZE = 10;
export const INITIAL_NUM_TO_RENDER = 8;

// Spotify-inspired color palette
const colors = {
  primary: '#1DB954', // Spotify green
  background: '#121212', // Dark background
  surface: '#181818', // Card background
  surfaceLight: '#282828', // Lighter surface
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textMuted: '#727272',
  accent: '#1ED760',
  error: '#E22134',
  overlay: 'rgba(0, 0, 0, 0.7)',
  gradientStart: '#1DB954',
  gradientEnd: '#1ED760',
  border: 'rgba(255, 255, 255, 0.1)',
  searchBackground: '#242424',
};

// Fix: Gradient backgrounds for categories với type annotation chính xác
export const gradientColors = [
  ['#1DB954', '#1ED760'] as const, // Green
  ['#E22134', '#FF6B35'] as const, // Red to Orange
  ['#2E77D0', '#5E9CFF'] as const, // Blue
  ['#8E44AD', '#BB6BD9'] as const, // Purple
  ['#F39C12', '#F7DC6F'] as const, // Orange to Yellow
  ['#16A085', '#48CAE4'] as const, // Teal to Light Blue
  ['#E74C3C', '#F8BBD9'] as const, // Red to Pink
  ['#9B59B6', '#D7BDE2'] as const, // Purple to Light Purple
] as const;

export const homeStyles = StyleSheet.create({
  flex: { 
    flex: 1 
  },
  
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  
  loadingText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header Styles - Spotify-inspired
  headerContainer: { 
    paddingHorizontal: 16, 
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  greetingContainer: {
    flex: 1,
  },
  
  greetingText: { 
    color: colors.text, 
    fontSize: isTablet ? 28 : 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  
  userNameText: { 
    color: colors.textSecondary, 
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
  },
  
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Search Styles - Spotify-inspired
  searchContainer: {
    marginBottom: 24,
  },
  
  searchRow: { 
    flexDirection: 'row', 
    backgroundColor: colors.searchBackground, 
    borderRadius: 25, 
    alignItems: 'center', 
    paddingHorizontal: 16,
    height: isTablet ? 52 : 48,
  },
  
  searchIcon: {
    marginRight: 12,
  },
  
  searchInput: { 
    flex: 1, 
    color: colors.text, 
    fontSize: isTablet ? 16 : 14,
    fontWeight: '400',
  },
  
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  
  // Quick Access Cards (like Spotify's recent items)
  quickAccessContainer: {
    marginBottom: 32,
  },
  
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  
  quickAccessCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    height: 56,
    backgroundColor: colors.surfaceLight,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  
  quickAccessImage: {
    width: 56,
    height: 56,
    backgroundColor: colors.surface,
  },
  
  quickAccessText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  
  // Section Headers - Spotify style
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  
  sectionTitle: { 
    color: colors.text, 
    fontSize: isTablet ? 24 : 20, 
    fontWeight: '700',
  },
  
  seeAllText: {
    color: colors.textSecondary,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  
  // Podcast Cards - Spotify-inspired
  horizontalListContent: { 
    paddingLeft: 16,
    paddingVertical: 8,
  },
  
  podcastCard: { 
    marginRight: 16,
    width: cardWidth,
  },
  
  podcastImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  
  podcastImage: { 
    width: '100%', 
    height: cardWidth, 
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  
  playButtonOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
    transform: [{ scale: 0.8 }, { translateY: 10 }],
  },
  
  podcastCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  
  podcastTitle: { 
    color: colors.text, 
    fontSize: isTablet ? 14 : 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  
  podcastArtist: {
    color: colors.textSecondary,
    fontSize: isTablet ? 12 : 11,
    fontWeight: '400',
  },
  
  // Categories Grid - Spotify-inspired
  categoriesContainer: {
    marginBottom: 32,
  },
  
  categoriesGrid: {
    paddingHorizontal: 16,
  },
  
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  
  categoryCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    height: 100,
    borderRadius: 8,
    padding: 16,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  
  categoryGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  
  categoryTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  categoryIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    transform: [{ rotate: '25deg' }],
    opacity: 0.8,
  },
  
  // Vertical Cards - Spotify-inspired
  verticalCard: { 
    flexDirection: 'row', 
    backgroundColor: 'transparent',
    marginBottom: 8, 
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    minHeight: ITEM_HEIGHT,
  },
  
  verticalImage: { 
    width: isTablet ? 64 : 56, 
    height: isTablet ? 64 : 56, 
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  
  verticalContent: { 
    flex: 1, 
    paddingLeft: 12,
    paddingRight: 8,
  },
  
  verticalTitle: { 
    color: colors.text, 
    fontSize: isTablet ? 16 : 14, 
    fontWeight: '600',
    marginBottom: 2,
  },
  
  verticalDesc: { 
    color: colors.textSecondary, 
    fontSize: isTablet ? 14 : 12, 
    fontWeight: '400',
  },
  
  moreButton: {
    padding: 8,
  },
  
  mainListContent: { 
    paddingBottom: 120,
  },
  
  // Search States
  searchLoadingContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  
  searchLoadingText: {
    color: colors.primary,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  
  emptySearchContainer: {
    paddingTop: 80,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  emptySearchIcon: {
    marginBottom: 16,
  },
  
  emptySearchText: {
    color: colors.text,
    fontSize: isTablet ? 18 : 16,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  
  emptySearchSubtext: {
    color: colors.textSecondary,
    fontSize: isTablet ? 16 : 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Modal Styles - Spotify-inspired
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  
  modalBackground: {
    flex: 1,
  },
  
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: SCREEN_HEIGHT * 0.8,
  },
  
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  
  modalHandle: {
    width: 32,
    height: 4,
    backgroundColor: colors.textMuted,
    borderRadius: 2,
    marginBottom: 16,
  },
  
  modalTitle: {
    color: colors.text,
    fontSize: isTablet ? 20 : 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  
  modalList: {
    padding: 16,
  },
  
  modalCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  
  modalCategoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  
  modalCategoryText: {
    flex: 1,
    color: colors.text,
    fontSize: isTablet ? 16 : 14,
    fontWeight: '600',
  },
  
  // Animated states
  pressedOpacity: {
    opacity: 0.7,
  },
});

export { colors };
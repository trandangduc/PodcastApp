import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import authService from '../../services/api/authService';

const featuredPodcasts = [
  {
    id: '1',
    title: 'Hành trình khởi nghiệp',
    thumbnail: 'https://i1.sndcdn.com/artworks-000658424191-16fudx-t500x500.jpg',
  },
  {
    id: '2',
    title: 'Tư duy phản biện',
    thumbnail: 'https://i1.sndcdn.com/artworks-000605790204-gcdh3f-t500x500.jpg',
  },
  {
    id: '3',
    title: 'Học kỹ năng sống',
    thumbnail: 'https://i1.sndcdn.com/artworks-000433896052-b3t18q-t500x500.jpg',
  },
];

const categories = [
  { id: '1', name: 'Giáo dục', icon: 'school-outline' },
  { id: '2', name: 'Công nghệ', icon: 'hardware-chip-outline' },
  { id: '3', name: 'Kỹ năng', icon: 'construct-outline' },
  { id: '4', name: 'Giải trí', icon: 'musical-notes-outline' },
  { id: '5', name: 'Sức khoẻ', icon: 'fitness-outline' },
  { id: '6', name: 'Tin tức', icon: 'newspaper-outline' },
];

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await authService.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserData();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.logout();
              authService.removeAuthHeader();
              // AppNavigator sẽ tự động chuyển về Auth khi check lại
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const renderPodcast = ({ item }: any) => (
    <TouchableOpacity style={styles.podcastCard}>
      <Image source={{ uri: item.thumbnail }} style={styles.podcastImage} />
      <Text style={styles.podcastTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: any) => (
    <TouchableOpacity style={styles.categoryCard}>
      <Ionicons name={item.icon} size={24} color="#4CAF50" />
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View>
      {/* User welcome section */}
      <View style={[
        styles.welcomeContainer, 
        { marginTop: insets.top + 16 } // Add safe area top + padding
      ]}>
        <View>
          <Text style={styles.welcomeText}>
            Chào mừng, {user?.ho_ten || 'Người dùng'}!
          </Text>
          <Text style={styles.userRole}>
            {user?.vai_tro === 'admin' ? 'Quản trị viên' : 'Người dùng'}
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Podcast nổi bật</Text>
      <FlatList
        data={featuredPodcasts}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={renderPodcast}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
      <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Danh mục</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }]}>
      <StatusBar backgroundColor="#1a1a1a" barStyle="light-content" />
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={renderCategory}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{ 
          paddingHorizontal: 8, 
          paddingBottom: insets.bottom + 100 // Add safe area bottom + tab bar space
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  welcomeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#4CAF50',
    fontSize: 14,
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#444',
    borderRadius: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  podcastCard: {
    marginRight: 16,
    width: 140,
  },
  podcastImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    marginBottom: 8,
  },
  podcastTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryCard: {
    flex: 1 / 3,
    backgroundColor: '#2d2d2d',
    margin: 6,
    paddingVertical: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default HomeScreen;
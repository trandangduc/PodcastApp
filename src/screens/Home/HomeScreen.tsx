import React, { useState, useEffect, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import authService from '../../services/api/authService';
import debounce from 'lodash.debounce';

const featuredPodcasts = [
  { id: '1', title: 'Hành trình khởi nghiệp', thumbnail: 'https://i1-dulich.vnecdn.net/2020/04/06/8-1586184545.jpg?w=0&h=0&q=100&dpr=2&fit=crop&s=TF96je1mmPT7LXED5s3G6A' },
  { id: '2', title: 'Tư duy phản biện', thumbnail: 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/482784oup/anh-mo-ta.png' },
  { id: '3', title: 'Học kỹ năng sống', thumbnail: 'https://images.pexels.com/photos/12312683/pexels-photo-12312683.jpeg?cs=srgb&dl=pexels-miss-pueblos-m%C3%A1gicos-12312683.jpg&fm=jpg' },
  { id: '4', title: 'Khám phá công nghệ', thumbnail: 'https://i.pinimg.com/736x/6d/42/2f/6d422fd2fb8fdf145228e8bd05702ee9.jpg' },
];

const categories = [
  { id: '1', name: 'Giáo dục', icon: 'school-outline' },
  { id: '2', name: 'Công nghệ', icon: 'hardware-chip-outline' },
  { id: '3', name: 'Kỹ năng', icon: 'construct-outline' },
  { id: '4', name: 'Giải trí', icon: 'musical-notes-outline' },
  { id: '5', name: 'Sức khoẻ', icon: 'fitness-outline' },
  { id: '6', name: 'Tin tức', icon: 'newspaper-outline' },
];

const verticalPodcasts = [
  { id: '101', title: 'Làm chủ cảm xúc', description: 'Kiểm soát cảm xúc hiệu quả.', thumbnail: 'https://img.freepik.com/emotion.jpg' },
  { id: '102', title: 'Marketing thời đại số', description: 'Chiến lược tiếp thị số.', thumbnail: 'https://img.freepik.com/marketing.jpg' },
  { id: '103', title: 'Tư duy logic', description: 'Giải quyết vấn đề thông minh.', thumbnail: 'https://img.freepik.com/thinking.jpg' },
];

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [searchText, setSearchText] = useState('');
  const [filteredPodcasts, setFilteredPodcasts] = useState(featuredPodcasts);
  const [searching, setSearching] = useState(false);

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

  const handleSearch = useCallback(
    debounce((text: string) => {
      if (text.trim() === '') {
        setFilteredPodcasts(featuredPodcasts);
        setSearching(false);
      } else {
        const results = featuredPodcasts.filter((item) =>
          item.title.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredPodcasts(results);
        setSearching(true);
      }
    }, 300),
    []
  );

  const onSearchTextChange = (text: string) => {
    setSearchText(text);
    handleSearch(text);
  };

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đăng xuất', style: 'destructive', onPress: async () => {
          await authService.logout();
          authService.removeAuthHeader();
        },
      },
    ]);
  };

  const handlePodcastPress = (item: any) => {
    navigation.navigate('PodcastDetail', { podcast: item });
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 8 }]}>      
      <Text style={styles.welcomeText}>Xin chào, <Text style={styles.bold}>{user?.ho_ten || 'Người dùng'}</Text></Text>
      <Text style={styles.roleText}>{user?.vai_tro === 'admin' ? 'Quản trị viên' : 'Người dùng'}</Text>
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
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <StatusBar backgroundColor="#1a1a1a" barStyle="light-content" />
          {renderHeader()}
          <FlatList
            ListHeaderComponent={
              !searching ? (
                <>
                  <Text style={styles.sectionTitle}>Podcast nổi bật</Text>
                  <FlatList
                    data={filteredPodcasts}
                    horizontal
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.podcastCard} onPress={() => handlePodcastPress(item)}>
                        <Image source={{ uri: item.thumbnail }} style={styles.podcastImage} />
                        <Text style={styles.podcastTitle}>{item.title}</Text>
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 16 }}
                    showsHorizontalScrollIndicator={false}
                  />
                  <Text style={styles.sectionTitle}>Danh mục</Text>
                  <FlatList
                    data={categories}
                    numColumns={3}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.categoryCard} onPress={() => Alert.alert('Danh mục', item.name)}>
                        <Ionicons name={item.icon} size={24} color="#4CAF50" />
                        <Text style={styles.categoryText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                  />
                  <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
                </>
              ) : null
            }
            data={filteredPodcasts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.verticalCard} onPress={() => handlePodcastPress(item)}>
                <Image source={{ uri: item.thumbnail }} style={styles.verticalImage} />
                <View style={{ flex: 1, paddingLeft: 10 }}>
                  <Text style={styles.verticalTitle}>{item.title}</Text>
                  <Text style={styles.verticalDesc}>{item.description}</Text>
                </View>
                <Ionicons name="play-circle-outline" size={26} color="#4CAF50" />
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  headerContainer: { paddingHorizontal: 16, marginBottom: 12 },
  welcomeText: { color: '#fff', fontSize: 15 },
  roleText: { color: '#4CAF50', fontSize: 13, marginBottom: 8 },
  bold: { fontWeight: 'bold' },
  searchRow: { flexDirection: 'row', backgroundColor: '#1f1f1f', borderRadius: 10, alignItems: 'center', paddingHorizontal: 10 },
  searchInput: { flex: 1, height: 40, color: '#fff', fontSize: 14 },
  iconButton: { paddingLeft: 8 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold', marginVertical: 14 },
  podcastCard: { marginRight: 14, width: 140 },
  podcastImage: { width: '100%', height: 140, borderRadius: 12, marginBottom: 6 },
  podcastTitle: { color: '#fff', fontSize: 14 },
  categoryCard: { flex: 1, backgroundColor: '#1f1f1f', margin: 6, paddingVertical: 20, borderRadius: 12, alignItems: 'center' },
  categoryText: { color: '#fff', marginTop: 8, fontSize: 13, textAlign: 'center' },
  verticalCard: { flexDirection: 'row', backgroundColor: '#1e1e1e', marginBottom: 12, borderRadius: 10, padding: 10, alignItems: 'center' },
  verticalImage: { width: 60, height: 60, borderRadius: 8 },
  verticalTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  verticalDesc: { color: '#ccc', fontSize: 12, marginTop: 4 },
});

export default HomeScreen;

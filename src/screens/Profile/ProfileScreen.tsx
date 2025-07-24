import React, { useState, useEffect } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { useIsFocused } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../../services/api/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { logout: contextLogout } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await authService.getUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isFocused) {
      if (!user) setIsLoading(true);
      loadUserData();
    }
  }, [isFocused]);

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
              await contextLogout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      id: '1',
      title: 'Thông tin cá nhân',
      icon: 'person-outline',
      onPress: () => navigation.navigate('DetailsProfileScreen'),
    },
    {
      id: '2',
      title: 'Cài đặt',
      icon: 'settings-outline',
      onPress: () => navigation.navigate('AccountSettingsScreen'),
    },
    {
      id: '3',
      title: 'Podcast đã thích',
      icon: 'heart-outline',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
    {
      id: '4',
      title: 'Lịch sử nghe',
      icon: 'time-outline',
      onPress: () => navigation.navigate('HistoryScreen'),
    },
    {
      id: '5',
      title: 'Trợ giúp',
      icon: 'help-circle-outline',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
  ];

  const getUserInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1DB954" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingBottom: insets.bottom + 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header với Gradient */}
        <LinearGradient
          colors={['#1DB954', '#1ed760', '#121212']}
          style={[styles.headerGradient, { paddingTop: insets.top }]}
          locations={[0, 0.4, 1]}
        >
          <View style={styles.headerContent}>
            {/* Profile Info */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <LinearGradient
                  colors={['#1DB954', '#1ed760']}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {getUserInitials(user?.ho_ten || 'User')}
                  </Text>
                </LinearGradient>
              </View>
              
              <Text style={styles.userName}>{user?.ho_ten || 'Không có tên'}</Text>
              <Text style={styles.userStats}>
                {user?.vai_tro === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>Chỉnh sửa hồ sơ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* User Email Card */}
        <View style={styles.emailCard}>
          <View style={styles.emailIconContainer}>
            <Ionicons name="mail" size={20} color="#1DB954" />
          </View>
          <View style={styles.emailContent}>
            <Text style={styles.emailLabel}>Email</Text>
            <Text style={styles.emailValue}>{user?.email || 'Không có email'}</Text>
          </View>
        </View>

        {/* Menu Section */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Tùy chọn</Text>
          
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  index === menuItems.length - 1 && styles.lastMenuItem
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={styles.menuIconContainer}>
                    <Ionicons name={item.icon as any} size={22} color="#b3b3b3" />
                  </View>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#404040" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={22} color="#fff" />
            <Text style={styles.logoutButtonText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#b3b3b3',
    fontSize: 16,
  },
  headerGradient: {
    paddingBottom: 30,
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  userStats: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  actionButtonsContainer: {
    alignItems: 'center',
  },
  followButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 32,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
  },
  emailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emailContent: {
    flex: 1,
  },
  emailLabel: {
    fontSize: 12,
    color: '#b3b3b3',
    marginBottom: 2,
  },
  emailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  menuSection: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  menuContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default ProfileScreen;
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
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import authService from '../../services/api/authService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  // Thêm type cho navigation
  const navigation = useNavigation<NavigationProp>();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isFocused = useIsFocused();

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
      if (!user) setIsLoading(true); // chỉ loading khi chưa có user
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
              
              // Reset navigation stack and go to Auth
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }],
                })
              );
            } catch (error) {
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

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="account-circle" size={80} color="#4CAF50" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.ho_ten || 'Không có tên'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'Không có email'}</Text>
            <View style={styles.roleContainer}>
              <Text style={styles.roleLabel}>Vai trò: </Text>
              <Text style={styles.roleValue}>
                {user?.vai_tro === 'admin' ? 'Quản trị viên' : 'Người dùng'}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={24} color="#4CAF50" />
                <Text style={styles.menuItemText}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
    color: '#fff',
    fontSize: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userCard: {
    backgroundColor: '#2d2d2d',
    margin: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#999',
    fontSize: 14,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleLabel: {
    color: '#999',
    fontSize: 14,
  },
  roleValue: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  menuContainer: {
    backgroundColor: '#2d2d2d',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff4444',
    marginHorizontal: 20,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ProfileScreen;
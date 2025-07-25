// DetailsProfileScreen - Responsive
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ Add import
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { getProfile } from '../../services/api/profileService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DetailsProfileScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets(); // ✅ Add hook
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await getProfile();
        setUser(res);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      fetchUser();
    }
  }, [isFocused]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Responsive header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerText}>Thông Tin Cá Nhân</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfileScreen')}>
          <Feather name="edit" size={22} color="#fff" style={styles.editIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 40 } // ✅ Responsive bottom
        ]}
      >
        <View style={styles.avatarContainer}>
          <MaterialIcons name="account-circle" size={100} color="#4CAF50" />
        </View>

        <View style={styles.infoSection}>
          <ProfileItem label="Họ tên" value={user?.ho_ten} icon="person-outline" />
          <ProfileItem label="Email" value={user?.email} icon="mail-outline" />
          <ProfileItem
            label="Vai trò"
            value={user?.vai_tro === 'admin' ? 'Quản trị viên' : 'Người dùng'}
            icon="shield-checkmark-outline"
          />
          <ProfileItem
            label="Ngày tạo"
            value={new Date(user?.ngay_tao).toLocaleString()}
            icon="calendar-outline"
          />
          <ProfileItem
            label="Kích hoạt"
            value={user?.kich_hoat ? 'Đã kích hoạt' : 'Chưa kích hoạt'}
            icon="checkmark-done-circle-outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileItem = ({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) => (
  <View style={styles.itemContainer}>
    <View style={styles.leftSection}>
      <Ionicons name={icon} size={18} color="#4CAF50" style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
    </View>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    flexGrow: 1, // ✅ Changed from paddingBottom: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16, // ✅ Remove paddingVertical: 16
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    backgroundColor: '#1a1a1a', // ✅ Add background
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  editIcon: {
    padding: 4,
  },
  avatarContainer: {
    alignItems: 'center',
    backgroundColor: '#2e2a28ff',
    paddingVertical: 32,
    marginBottom: 16,
  },
  infoSection: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 20,
    paddingBottom: 20, // ✅ Add padding bottom
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    paddingVertical: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
  },
  value: {
    color: '#fff',
    fontSize: 16,
    flex: 1.2,
    textAlign: 'right',
  },
});

export default DetailsProfileScreen;
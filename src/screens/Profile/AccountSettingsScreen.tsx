import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AccountSettingsScreen = () => {
  const navigation = useNavigation();

  const sections = [
    {
      title: 'Tài khoản của tôi',
  data: [
    {
      title: 'Tài khoản & Bảo mật',
      icon: 'shield-checkmark-outline',
      onPress: () => navigation.navigate('AccountSecurityScreen'),
    },
    {
      title: 'Địa chỉ',
      icon: 'location-outline',
    },
  ],
    },
    {
      title: 'Cài đặt',
      data: [
        { title: 'Cài đặt Chat', icon: 'chatbox-ellipses-outline' },
        { title: 'Cài đặt Thông báo', icon: 'notifications-outline' },
        { title: 'Cài đặt riêng tư', icon: 'lock-closed-outline' },
        { title: 'Người dùng đã bị chặn', icon: 'close-circle-outline' },
        { title: 'Ngôn ngữ / Language', icon: 'language-outline', note: 'Tiếng Việt' },
      ],
    },
    {
      title: 'Hỗ trợ',
      data: [
        { title: 'Trung tâm hỗ trợ', icon: 'help-buoy-outline' },
        { title: 'Tiêu chuẩn cộng đồng', icon: 'people-outline' },
        { title: 'Điều khoản sử dụng', icon: 'document-text-outline' },
        { title: 'Hài lòng với ứng dụng? Hãy đánh giá ngay!', icon: 'star-outline' },
        { title: 'Giới thiệu', icon: 'information-circle-outline' },
        { title: 'Yêu cầu huỷ tài khoản', icon: 'trash-outline' },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            // TODO: Thêm logic đăng xuất
            navigation.navigate('Auth');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Thiết lập tài khoản</Text>

        {sections.map((section, index) => (
          <View key={index}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map((item, idx) => (
              <TouchableOpacity key={idx} style={styles.item}>
                <View style={styles.itemLeft}>
                  <Ionicons name={item.icon as any} size={22} color="#4CAF50" />
                  <Text style={styles.itemText}>{item.title}</Text>
                </View>
                <View style={styles.itemRight}>
                  {item.note && <Text style={styles.noteText}>{item.note}</Text>}
                  <Ionicons name="chevron-forward-outline" size={18} color="#aaa" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Đăng xuất */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
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
  header: {
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 16,
    color: '#fff',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    color: '#888',
    fontSize: 13,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#2d2d2d',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteText: {
    marginRight: 8,
    color: '#aaa',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    margin: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default AccountSettingsScreen;

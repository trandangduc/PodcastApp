import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { logout } = useAuth();

  const sections = [
    {
      title: 'Tài khoản',
      data: [
        {
          title: 'Thông tin cá nhân',
          icon: 'person-outline',
          onPress: () => navigation.navigate('DetailsProfileScreen'),
        },
        {
          title: 'Đổi mật khẩu',
          icon: 'lock-closed-outline',
          onPress: () => navigation.navigate('ChangePasswordScreen'),
        },
        {
          title: 'Tài khoản liên kết',
          icon: 'link-outline',
          onPress: () => navigation.navigate('SocialAccountsScreen'),
        },
      ],
    },
    {
      title: 'Cài đặt ứng dụng',
      data: [
        {
          title: 'Thông báo',
          icon: 'notifications-outline',
          isSwitch: true,
          switchValue: true,
          onToggle: (value: boolean) => {
            console.log('Thông báo:', value);
          },
        },
        {
          title: 'Chế độ tối',
          icon: 'moon-outline',
          isSwitch: true,
          switchValue: false,
          onToggle: (value: boolean) => {
            console.log('Dark mode:', value);
          },
        },
      ],
    },
    {
      title: 'Khác',
      data: [
        {
          title: 'Đăng xuất',
          icon: 'log-out-outline',
          onPress: () => logout(),
          danger: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Thiết lập tài khoản</Text>

        {sections.map((section, index) => (
          <View key={index}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.item,
                  item.danger && { backgroundColor: '#ff4444' },
                ]}
                activeOpacity={item.isSwitch ? 1 : 0.7}
                onPress={() => {
                  if (!item.isSwitch && item.onPress) item.onPress();
                }}
              >
                <View style={styles.itemLeft}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={item.danger ? '#fff' : '#4CAF50'}
                  />
                  <Text
                    style={[
                      styles.itemText,
                      item.danger && { color: '#fff', fontWeight: 'bold' },
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>

                {item.isSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#555', true: '#4CAF50' }}
                    thumbColor="#fff"
                  />
                ) : (
                  <Ionicons
                    name="chevron-forward-outline"
                    size={18}
                    color="#aaa"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

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
});

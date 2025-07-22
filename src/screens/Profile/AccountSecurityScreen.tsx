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
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ Add import
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { RootStackParamList } from '../../navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface BaseSettingsItem {
  title: string;
  icon: string;
  danger?: boolean;
}

interface PressableItem extends BaseSettingsItem {
  isSwitch?: false;
  onPress: () => void | Promise<void>;
}

interface SwitchItem extends BaseSettingsItem {
  isSwitch: true;
  switchValue: boolean;
  onToggle: (value: boolean) => void;
}

type SettingsItem = PressableItem | SwitchItem;

interface SettingsSection {
  title: string;
  data: SettingsItem[];
}

const SettingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets(); // ✅ Add hook
  const { logout } = useAuth();

  const sections: SettingsSection[] = [
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
          onPress: () => alert('Thông báo Tính năng đang phát triển'),
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
      <ScrollView 
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} // ✅ Responsive bottom
      >
        {/* ✅ Responsive header */}
        <Text style={[styles.header, { paddingTop: insets.top + 16 }]}>
          Thiết lập tài khoản
        </Text>
        
        {sections.map((section, index) => (
          <View key={index}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.data.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.item,
                  item.danger && styles.dangerItem
                ]}
                onPress={() => {
                  if (!item.isSwitch && 'onPress' in item) {
                    item.onPress();
                  }
                }}
                disabled={item.isSwitch}
              >
                <View style={styles.itemLeft}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={item.danger ? "#ff4444" : "#4CAF50"} 
                  />
                  <Text 
                    style={[
                      styles.itemText,
                      item.danger && styles.dangerText
                    ]}
                  >
                    {item.title}
                  </Text>
                </View>
                {item.isSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                    thumbColor={item.switchValue ? '#fff' : '#f4f3f4'}
                  />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
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
    paddingBottom: 16, // ✅ Remove paddingVertical: 16
    color: '#fff',
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    backgroundColor: '#1a1a1a', // ✅ Add background
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
  dangerItem: {
    backgroundColor: '#2d1f1f',
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
  dangerText: {
    color: '#ff4444',
  },
});

export default SettingsScreen;
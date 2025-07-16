import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const AccountSecurityScreen = () => {
  const navigation = useNavigation();
  const [fastLogin, setFastLogin] = React.useState(false);

  const handleToggleFastLogin = () => {
    setFastLogin((prev) => !prev);
  };

  const sections = [
    {
      title: 'Tài Khoản',
      items: [
        { label: 'Hồ sơ của tôi' },
        { label: 'Tên người dùng', value: 'btmhuongmh' },
        { label: 'Điện thoại', value: '*****55' },
        { label: 'Email nhận hóa đơn', value: 'm*********2@gmail.com' },
        { label: 'Tài khoản mạng xã hội' },
        { label: 'Đổi mật khẩu' },
        { label: 'Đăng nhập nhanh', isSwitch: true },
      ],
    },
    {
      title: 'Bảo Mật',
      items: [
        {
          label: 'Kiểm tra hoạt động của tài khoản',
          sub: 'Kiểm tra những lần đăng nhập và thay đổi tài khoản trong 30 ngày',
        },
        {
          label: 'Quản lý thiết bị đăng nhập',
          sub: 'Quản lý các thiết bị đã đăng nhập vào tài khoản',
          dot: true,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tài khoản & Bảo mật</Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.item}
                activeOpacity={item.isSwitch ? 1 : 0.7}
                onPress={() => {
                  if (!item.isSwitch) {
                    // TODO: handle navigation
                  }
                }}
              >
                <View style={styles.itemLeft}>
                  <Text style={styles.itemText}>{item.label}</Text>
                  {item.value && <Text style={styles.itemValue}>{item.value}</Text>}
                  {item.sub && <Text style={styles.itemSub}>{item.sub}</Text>}
                </View>
                {item.isSwitch ? (
                  <Switch
                    value={fastLogin}
                    onValueChange={handleToggleFastLogin}
                    trackColor={{ false: '#555', true: '#4CAF50' }}
                    thumbColor="#fff"
                  />
                ) : (
                  <View style={styles.itemRight}>
                    {item.dot && <View style={styles.dot} />}
                    <Ionicons name="chevron-forward" size={20} color="#aaa" />
                  </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    color: '#aaa',
    fontSize: 13,
    fontWeight: '500',
  },
  item: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flex: 1,
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  itemValue: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  itemSub: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 4,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: 'red',
    borderRadius: 4,
    marginRight: 8,
  },
});

export default AccountSecurityScreen;

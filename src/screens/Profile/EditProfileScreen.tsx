import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { getProfile, updateProfile } from '../../services/api/profileService';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setHoTen(data.ho_ten || '');
        setEmail(data.email || '');
      } catch (error: any) {
        Alert.alert('Lỗi', error.message || 'Không thể tải thông tin người dùng');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    if (!hoTen.trim() || !email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ tên và email');
      return;
    }

    try {
      setSubmitting(true);
      const res = await updateProfile({ ho_ten: hoTen.trim(), email: email.trim() });

      Alert.alert('Thành công', res.message || 'Cập nhật thành công', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.log('Lỗi cập nhật hồ sơ:', error?.response?.data);
      const status = error?.response?.status;
      const message = error?.response?.data?.error;

      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
      if (status === 400 && message === 'Email đã được sử dụng') {
        errorMessage = 'Email đã được sử dụng. Vui lòng chọn email khác.';
      } else if (status === 404) {
        errorMessage = 'Không tìm thấy người dùng.';
      } else if (status === 401) {
        errorMessage = 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.';
      } else if (status === 500) {
        errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau.';
      } else if (message) {
        errorMessage = message;
      }

      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chỉnh sửa hồ sơ</Text>
        <TouchableOpacity onPress={handleSave} disabled={submitting}>
          <Feather name="save" size={22} color="#fff" style={styles.editIcon} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <MaterialIcons name="account-circle" size={100} color="#4CAF50" />
        </View>

        <View style={styles.formSection}>
          <InputItem
            label="Họ tên"
            value={hoTen}
            onChangeText={setHoTen}
            icon="person-outline"
          />
          <InputItem
            label="Email"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const InputItem = ({
  label,
  value,
  onChangeText,
  icon,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={18} color="#4CAF50" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Nhập ${label.toLowerCase()}`}
        placeholderTextColor="#888"
        autoCapitalize="none"
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  content: {
    paddingBottom: 40,
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    alignItems: 'center',
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
    backgroundColor: '#2e2a28',
    paddingVertical: 32,
    marginBottom: 16,
  },
  formSection: {
    backgroundColor: '#2d2d2d',
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  icon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    color: '#fff',
    paddingVertical: 10,
    fontSize: 16,
  },
});

export default EditProfileScreen;

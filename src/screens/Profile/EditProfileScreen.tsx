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
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { getProfile, updateProfile } from '../../services/api/profileService';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getProfile();
        setUser(res);
        setHoTen(res.ho_ten || '');
        setEmail(res.email || '');
      } catch (error) {
        console.error('Lỗi khi tải thông tin:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const isChanged = hoTen !== user?.ho_ten || email !== user?.email;

  const handleSave = async () => {
    if (!hoTen || !email) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ họ tên và email');
      return;
    }

    try {
      setSubmitting(true);
      const res = await updateProfile({ ho_ten: hoTen, email });
      Alert.alert('Thành công', res.message, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.error || 'Có lỗi xảy ra. Vui lòng thử lại.';
      Alert.alert('Lỗi', errMsg);
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
        <TouchableOpacity
          onPress={handleSave}
          disabled={!isChanged || submitting}
          style={{ opacity: isChanged ? 1 : 0.3 }}
        >
          <Feather name="save" size={22} color="#4CAF50" style={styles.editIcon} />
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
            icon={<Feather name="user" size={20} color="#4CAF50" style={{ marginRight: 8 }} />}
          />
          <InputItem
            label="Email"
            value={email}
            onChangeText={setEmail}
            icon={<Feather name="mail" size={20} color="#4CAF50" style={{ marginRight: 8 }} />}
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
  icon: React.ReactNode;
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      {icon}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={`Nhập ${label.toLowerCase()}`}
        placeholderTextColor="#888"
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
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
});

export default EditProfileScreen;

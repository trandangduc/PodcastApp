import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ Add import
import { useNavigation } from '@react-navigation/native';
import { changePassword } from '../../services/api/profileService';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets(); // ✅ Add hook
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setSubmitting(true);
      const res = await changePassword({
        mat_khau_cu: oldPassword,
        mat_khau_moi: newPassword,
      });

      Alert.alert('Thành công', res.message || 'Đổi mật khẩu thành công', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      console.log('LỖI ĐỔI MẬT KHẨU:', error);
      Alert.alert('Lỗi', error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ✅ Responsive header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.headerText}>Đổi mật khẩu</Text>
      </View>

      <ScrollView 
        contentContainerStyle={[
          styles.form,
          { paddingBottom: insets.bottom + 40 } // ✅ Responsive bottom
        ]}
      >
        <PasswordInput
          label="Mật khẩu hiện tại"
          value={oldPassword}
          onChangeText={setOldPassword}
        />
        <PasswordInput
          label="Mật khẩu mới"
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <PasswordInput
          label="Xác nhận mật khẩu mới"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <TouchableOpacity
          style={[styles.button, submitting && { opacity: 0.5 }]}
          onPress={handleChangePassword}
          disabled={submitting}
        >
          <Feather name="lock" size={20} color="#fff" />
          <Text style={styles.buttonText}>Lưu mật khẩu mới</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const PasswordInput = ({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) => {
  const [secure, setSecure] = useState(true);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="********"
          placeholderTextColor="#888"
          secureTextEntry={secure}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)}>
          <Ionicons
            name={secure ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#aaa"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1a1a1a' 
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16, // ✅ Remove paddingVertical
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a', // ✅ Add background
  },
  headerText: { 
    color: '#fff', 
    fontSize: 20, 
    fontWeight: 'bold' 
  },
  form: { 
    paddingHorizontal: 20,
    paddingTop: 20,
    flexGrow: 1, // ✅ Changed from padding: 20
  },
  inputContainer: { 
    marginBottom: 16 
  },
  label: { 
    color: '#ccc', 
    fontSize: 14, 
    marginBottom: 6 
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2e2e2e',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default ChangePasswordScreen;
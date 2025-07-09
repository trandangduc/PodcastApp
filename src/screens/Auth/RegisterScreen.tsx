import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import apiClient from '../../services/api/auth'; // Đường dẫn tới apiClient

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/register', {
        ho_ten: fullName,
        email: email,
        mat_khau: password,
      });

      if (response.status === 201 || response.status === 200) {
        Alert.alert('Thành công', 'Tạo tài khoản thành công!');
        navigation.replace('Login');
      } else {
        Alert.alert('Lỗi', 'Đăng ký không thành công');
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        'Lỗi',
        error?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Tạo tài khoản</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Họ tên</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#666"
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={isPasswordVisible ? 'eye-off' : 'eye'}
                    size={20}
                    color="#4CAF50"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => navigation.replace('Login')}>
                <Text style={styles.signUpLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  formContainer: {
    backgroundColor: '#2d2d2d',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 8,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#444',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
  },
  eyeButton: {
    padding: 8,
  },
  loginButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  signUpText: {
    color: '#999',
    fontSize: 14,
  },
  signUpLink: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;

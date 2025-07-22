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
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation';
import { Ionicons, MaterialIcons, AntDesign } from '@expo/vector-icons';
import authService from '../../services/api/authService';

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = (): boolean => {
    setEmailError('');
    setPasswordError('');

    let isValid = true;

    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      isValid = false;
    } else if (!email.includes('@')) {
      setEmailError('Email không hợp lệ');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call login API
      const loginData = await authService.login({
        email: email.trim(),
        mat_khau: password,
      });

      // Save auth data to AsyncStorage
      await authService.saveAuthData(loginData.token, loginData.user, rememberMe);
      // Đợi một chút để đảm bảo AsyncStorage đã lưu xong (đặc biệt cho iOS)
      if (Platform.OS === 'ios') {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      // Set authorization header for subsequent requests
      authService.setAuthHeader(loginData.token);

      // Success - AppNavigator will automatically detect the token and switch to TabNavigator
      Alert.alert('Thành công', 'Đăng nhập thành công!');

    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Lỗi', error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Quên mật khẩu',
      'Tính năng này sẽ được triển khai trong phiên bản tiếp theo.',
      [{ text: 'OK' }]
    );
  };

  const handleSignUp = () => {
    navigation.navigate('Register');
  };

  const handleSocialLogin = (platform: string) => {
    Alert.alert(
      `Đăng nhập ${platform}`,
      'Tính năng này sẽ được triển khai trong phiên bản tiếp theo.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Đăng nhập</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="email" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email của bạn"
                  placeholderTextColor="#666"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) setPasswordError('');
                  }}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-off" : "eye"}
                    size={20}
                    color="#4CAF50"
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Remember Me Toggle */}
            <View style={styles.rememberMeContainer}>
              <Text style={styles.rememberMeText}>Ghi nhớ đăng nhập</Text>
              <Switch
                value={rememberMe}
                onValueChange={setRememberMe}
                trackColor={{ false: '#444', true: '#4CAF50' }}
                thumbColor={rememberMe ? '#fff' : '#999'}
                disabled={isLoading}
              />
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="refresh" size={20} color="#fff" style={styles.loadingIcon} />
                  <Text style={styles.loginButtonText}>Đang đăng nhập...</Text>
                </View>
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.loginButtonText}>Đăng nhập</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={() => handleSocialLogin('Google')}
              disabled={isLoading}
            >
              <View style={styles.socialButtonContent}>
                <AntDesign name="google" size={20} color="#fff" style={styles.socialIcon} />
                <Text style={styles.socialButtonText}>Đăng nhập với Google</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={handleSignUp} disabled={isLoading}>
                <Text style={styles.signUpLink}>Đăng ký ngay</Text>
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
  },
  eyeButton: {
    padding: 8,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  rememberMeText: {
    color: '#fff',
    fontSize: 16,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#4CAF50',
    fontSize: 14,
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#444',
  },
  dividerText: {
    color: '#999',
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  socialButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialIcon: {
    marginRight: 12,
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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
  errorText: {
    color: '#ff4444',
    marginTop: 4,
    marginLeft: 8,
    fontSize: 13,
  },
});

export default LoginScreen;
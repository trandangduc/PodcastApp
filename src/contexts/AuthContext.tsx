import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Platform } from 'react-native';
import authService from '../services/api/authService';

interface User {
  email: string;
  ho_ten: string;
  id: string;
  vai_tro: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  refreshUser: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      await authService.setupAutoLogin();
      
      const authenticated = await authService.isAuthenticated();
      if (authenticated) {
        const [storedToken, storedUser] = await Promise.all([
          authService.getToken(),
          authService.getUser(),
        ]);
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
          authService.setAuthHeader(storedToken);
        } else {
          throw new Error('Missing token or user data');
        }
      } else {
        await resetAuthState();
      }
    } catch (error) {
      console.error('❌ Auth status check failed:', error);
      await resetAuthState();
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function để reset auth state
  const resetAuthState = async () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    authService.removeAuthHeader();
    
    // Clear any remaining auth data
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      
      const loginData = await authService.login({
        email,
        mat_khau: password,
      });
      // Lưu data với delay cho iOS
      await authService.saveAuthData(loginData.token, loginData.user, rememberMe);
      
      // iOS cần thời gian để persist AsyncStorage
      if (Platform.OS === 'ios') {
        await new Promise(resolve => setTimeout(resolve, 500)); // Tăng delay
      }
      
      // Verify data đã được lưu
      const savedToken = await authService.getToken();
      if (!savedToken) {
        throw new Error('Failed to save token');
      }
      authService.setAuthHeader(loginData.token);
      
      setToken(loginData.token);
      setUser(loginData.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Set loading state để tránh flicker
      setIsLoading(true);
      
      // Clear auth data từ service
      await authService.logout();
      authService.removeAuthHeader();
      
      // Reset local state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
    } catch (error) {
      // Ngay cả khi có lỗi, vẫn reset state để đảm bảo user được logout
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      authService.removeAuthHeader();
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Thêm method để refresh user data
  const refreshUser = async () => {
    try {
      const updatedUser = await authService.getUser(true); // force refresh
      if (updatedUser) {
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      // Nếu không thể refresh, có thể token đã hết hạn
      await logout();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuthStatus,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
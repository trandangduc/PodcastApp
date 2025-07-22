// AuthContext.tsx - FIXED
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
      console.log('🔍 Checking auth status...'); // Debug log

      // Setup auto login trước
      await authService.setupAutoLogin();
      
      const authenticated = await authService.isAuthenticated();
      console.log('🔍 Is authenticated:', authenticated); // Debug log
      
      if (authenticated) {
        const [storedToken, storedUser] = await Promise.all([
          authService.getToken(),
          authService.getUser(),
        ]);
        
        console.log('🔍 Token exists:', !!storedToken); // Debug log
        console.log('🔍 User exists:', !!storedUser); // Debug log
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
          setIsAuthenticated(true);
          authService.setAuthHeader(storedToken);
          console.log('✅ Auth setup complete'); // Debug log
        } else {
          throw new Error('Missing token or user data');
        }
      } else {
        console.log('❌ Not authenticated'); // Debug log
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        authService.removeAuthHeader();
      }
    } catch (error) {
      console.error('❌ Auth status check failed:', error);
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      authService.removeAuthHeader();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean) => {
    try {
      console.log('🚀 Starting login process...'); // Debug log
      
      const loginData = await authService.login({
        email,
        mat_khau: password,
      });
      
      console.log('✅ Login API successful, saving data...'); // Debug log
      
      // Lưu data với delay cho iOS
      await authService.saveAuthData(loginData.token, loginData.user, rememberMe);
      
      // iOS cần thời gian để persist AsyncStorage
      if (Platform.OS === 'ios') {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      // Verify data đã được lưu
      const savedToken = await authService.getToken();
      if (!savedToken) {
        throw new Error('Failed to save token');
      }
      
      console.log('✅ Auth data saved, setting header...'); // Debug log
      
      authService.setAuthHeader(loginData.token);
      
      setToken(loginData.token);
      setUser(loginData.user);
      setIsAuthenticated(true);
      
      console.log('🎉 Login completed successfully'); // Debug log
      
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔒 Logging out...'); // Debug log
      
      await authService.logout();
      authService.removeAuthHeader();
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('✅ Logout completed'); // Debug log
      
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
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
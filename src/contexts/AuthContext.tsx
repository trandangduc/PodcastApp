import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
        }
      } else {
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        authService.removeAuthHeader();
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
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
      const loginData = await authService.login({
        email,
        mat_khau: password,
      });

      await authService.saveAuthData(loginData.token, loginData.user, rememberMe);
      authService.setAuthHeader(loginData.token);

      setToken(loginData.token);
      setUser(loginData.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      authService.removeAuthHeader();
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
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
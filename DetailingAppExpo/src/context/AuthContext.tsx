import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/api';
import { User, LoginDTO, RegisterDTO } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDTO) => Promise<void>;
  register: (data: RegisterDTO) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('accessToken');

      if (storedUser && token) {
        const session = await apiService.validateSession();
        if (session.hasActiveSession) {
          setUser(JSON.parse(storedUser));
        } else {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        }
      }
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        console.error('Auth check error:', error);
      }
      await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginDTO) => {
    try {
      const response = await apiService.login(credentials);
      
      if (!response.token) {
        throw new Error('Ошибка входа: отсутствует токен доступа');
      }
      
      if (!response.user) {
        throw new Error('Ошибка входа: отсутствуют данные пользователя');
      }
      
      await AsyncStorage.setItem('accessToken', response.token);
      if (response.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
      }
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error: any) {
      let errorMessage = 'Ошибка входа';
      
      if (error.response?.data) {
        const serverData = error.response.data;
        errorMessage = serverData.Message || serverData.message || errorMessage;
      } else if (error.response?.status === 401) {
        errorMessage = 'Неверный email или пароль';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const register = async (data: RegisterDTO) => {
    try {
      const response = await apiService.register(data);
      if (response.message && (response.message.includes('уже есть') || response.message.includes('не совпадают') || response.message.includes('Ошибка'))) {
        throw new Error(response.message);
      }
      return;
    } catch (error: any) {
      let errorMessage = 'Ошибка регистрации';
      
      if (error.response?.data) {
        const serverData = error.response.data;
        errorMessage = serverData.Message || serverData.message || errorMessage;
      } else if (error.response?.status === 400) {
        const serverData = error.response.data;
        errorMessage = serverData.Message || serverData.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


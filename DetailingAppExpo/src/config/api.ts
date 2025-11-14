// API Configuration
// Для Android эмулятора используйте 'http://10.0.2.2:5266'
// Для iOS симулятора используйте 'http://localhost:5266'
// Для физического устройства используйте IP адрес вашего компьютера, например 'http://192.168.1.100:5266'
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      // Для Android эмулятора
      return 'http://10.0.2.2:5266';
    }
    // Для Expo Go на физическом устройстве используем локальный IP
    // hostUri имеет формат: "192.168.1.100:8081"
    if (Constants.expoConfig?.hostUri) {
      const hostUri = Constants.expoConfig.hostUri.split(':')[0];
      return `http://${hostUri}:5266`;
    }
    // Для iOS симулятора или веб
    return 'http://localhost:5266';
  }
  return 'https://your-production-api.com'; // Production
};

export const API_BASE_URL = getBaseUrl();

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    SESSION: '/api/auth/session',
  },
  SERVICES: {
    GET_ALL: '/api/services',
    GET_BY_ID: (id: number) => `/api/services/${id}`,
  },
  CART: {
    GET: (userId: number) => `/api/cart/${userId}`,
    ADD_ITEM: (userId: number) => `/api/cart/${userId}/items`,
    UPDATE_ITEM: (userId: number, itemId: number) => `/api/cart/${userId}/items/${itemId}`,
    REMOVE_ITEM: (userId: number, itemId: number) => `/api/cart/${userId}/items/${itemId}`,
    CLEAR: (userId: number) => `/api/cart/${userId}`,
    GET_COUNT: (userId: number) => `/api/cart/${userId}/count`,
    GET_TOTAL: (userId: number) => `/api/cart/${userId}/total`,
  },
  ORDERS: {
    GET_BY_ID: (id: number) => `/api/orders/${id}`,
    GET_BY_USER: (userId: number) => `/api/orders/user/${userId}`,
    CREATE_FROM_CART: '/api/orders/from-cart',
  },
  BOOKINGS: {
    GET_AVAILABLE_SLOTS: '/api/bookings/available-slots',
    CREATE: '/api/bookings',
    GET_BY_ID: (id: number) => `/api/bookings/${id}`,
    GET_BY_USER: (userId: number) => `/api/bookings/user/${userId}`,
  },
};


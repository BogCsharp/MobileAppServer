import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';
import {
  AuthResponse,
  LoginDTO,
  RegisterDTO,
  Service,
  Cart,
  CartItem,
  Order,
  Booking,
  TimeSlot,
  CreateBookingDTO,
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для добавления токена к запросам
    this.api.interceptors.request.use(
      async (config: any) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Interceptor для обработки ошибок и обновления токена
    this.api.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await AsyncStorage.getItem('refreshToken');
            if (refreshToken) {
              const response: any = await axios.post(
                `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
                { refreshToken }
              );

              const serverData = response.data;
              const token = serverData.AccessToken || serverData.token;
              const newRefreshToken = serverData.RefreshToken || serverData.refreshToken;
              if (token) {
                await AsyncStorage.setItem('accessToken', token);
              }
              if (newRefreshToken) {
                await AsyncStorage.setItem('refreshToken', newRefreshToken);
              }

              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError: any) {
            // Если обновление токена не удалось, очищаем хранилище
            await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Helper для маппинга User с сервера
  private mapUser(serverUser: any): any {
    if (!serverUser) return null;
    // Обрабатываем разные варианты структуры ответа
    const userId = serverUser.Id ?? serverUser.id;
    const userEmail = serverUser.Email ?? serverUser.email;
    
    if (!userId || !userEmail) {
      console.warn('Неполные данные пользователя:', serverUser);
      return null;
    }
    
    return {
      id: userId,
      email: userEmail,
      firstName: serverUser.Name ?? serverUser.name ?? serverUser.firstName ?? '',
      lastName: serverUser.Surname ?? serverUser.surname ?? serverUser.lastName ?? '',
    };
  }

  // Auth methods
  async login(credentials: LoginDTO): Promise<AuthResponse> {
    const response = await this.api.post<any>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    // Маппинг полей с сервера (PascalCase) в формат клиента (camelCase)
    const serverData = response.data;
    const token =
      serverData.AccessToken ||
      serverData.accessToken ||
      serverData.Token ||
      serverData.token;
    const refreshToken =
      serverData.RefreshToken ||
      serverData.refreshToken ||
      serverData.Refresh ||
      serverData.refresh;

    return {
      message: serverData.Message || serverData.message,
      token,
      refreshToken,
      user: this.mapUser(serverData.User || serverData.user),
    };
  }

  async register(data: RegisterDTO): Promise<AuthResponse> {
    // Маппинг данных клиента в формат сервера (PascalCase)
    const serverData = {
      Name: data.firstName || '',
      Surname: data.lastName || '',
      Email: data.email,
      Password: data.password,
      ConfirmPassword: data.confirmPassword,
      Phone: data.phone || '',
      Birthday: data.birthday ? new Date(data.birthday).toISOString() : new Date().toISOString(),
    };
    
    const response = await this.api.post<any>(
      API_ENDPOINTS.AUTH.REGISTER,
      serverData
    );
    // Маппинг полей с сервера (PascalCase) в формат клиента (camelCase)
    const responseData = response.data;
    const token =
      responseData.AccessToken ||
      responseData.accessToken ||
      responseData.Token ||
      responseData.token;
    const refreshToken =
      responseData.RefreshToken ||
      responseData.refreshToken ||
      responseData.Refresh ||
      responseData.refresh;

    return {
      message: responseData.Message || responseData.message || 'Регистрация успешна',
      token,
      refreshToken,
      user: this.mapUser(responseData.User || responseData.user),
    };
  }

  async logout(): Promise<void> {
    await this.api.post(API_ENDPOINTS.AUTH.LOGOUT);
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
  }

  async validateSession(): Promise<{ hasActiveSession: boolean }> {
    const response = await this.api.get<{ hasActiveSession: boolean }>(
      API_ENDPOINTS.AUTH.SESSION
    );
    return response.data;
  }

  // Services methods
  async getServices(): Promise<Service[]> {
    const response = await this.api.get<Service[]>(API_ENDPOINTS.SERVICES.GET_ALL);
    return response.data;
  }

  async getServiceById(id: number): Promise<Service> {
    const response = await this.api.get<Service>(API_ENDPOINTS.SERVICES.GET_BY_ID(id));
    return response.data;
  }

  // Cart methods
  async getCart(userId: number): Promise<Cart> {
    const response = await this.api.get<Cart>(API_ENDPOINTS.CART.GET(userId));
    return response.data;
  }

  async addToCart(userId: number, serviceId: number, quantity: number): Promise<CartItem> {
    const response = await this.api.post<CartItem>(
      API_ENDPOINTS.CART.ADD_ITEM(userId),
      { serviceId, quantity }
    );
    return response.data;
  }

  async updateCartItem(userId: number, cartItemId: number, quantity: number): Promise<void> {
    await this.api.put(API_ENDPOINTS.CART.UPDATE_ITEM(userId, cartItemId), { quantity });
  }

  async removeFromCart(userId: number, cartItemId: number): Promise<void> {
    await this.api.delete(API_ENDPOINTS.CART.REMOVE_ITEM(userId, cartItemId));
  }

  async clearCart(userId: number): Promise<void> {
    await this.api.delete(API_ENDPOINTS.CART.CLEAR(userId));
  }

  async getCartCount(userId: number): Promise<number> {
    const response = await this.api.get<number>(API_ENDPOINTS.CART.GET_COUNT(userId));
    return response.data;
  }

  async getCartTotal(userId: number): Promise<number> {
    const response = await this.api.get<number>(API_ENDPOINTS.CART.GET_TOTAL(userId));
    return response.data;
  }

  // Orders methods
  async getOrderById(id: number): Promise<Order> {
    const response = await this.api.get<Order>(API_ENDPOINTS.ORDERS.GET_BY_ID(id));
    return response.data;
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    const response = await this.api.get<Order[]>(API_ENDPOINTS.ORDERS.GET_BY_USER(userId));
    return response.data;
  }

  async createOrderFromCart(data: {
    userId: number;
    carId: number;
    employeeId?: number;
    notes?: string;
    discountAmount?: number;
  }): Promise<Order> {
    const response = await this.api.post<Order>(
      API_ENDPOINTS.ORDERS.CREATE_FROM_CART,
      data
    );
    return response.data;
  }

  // Bookings methods
  async getAvailableSlots(date: string, serviceIds: number[]): Promise<TimeSlot[]> {
    const isoDate = new Date(date).toISOString();
    const response = await this.api.get<TimeSlot[]>(
      API_ENDPOINTS.BOOKINGS.GET_AVAILABLE_SLOTS,
      {
        params: {
          date: isoDate,
          serviceIds,
        },
        paramsSerializer: (params: Record<string, any>) => {
          const searchParams = new URLSearchParams();
          if (params.date) {
            searchParams.append('date', params.date as string);
          }
          const ids: any[] = params.serviceIds || [];
          ids.forEach((id) => {
            searchParams.append('serviceIds', String(id));
          });
          return searchParams.toString();
        },
      }
    );
    return response.data;
  }

  async createBooking(data: CreateBookingDTO): Promise<Booking> {
    const response = await this.api.post<Booking>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      data
    );
    return response.data;
  }

  async getBookingById(id: number): Promise<Booking> {
    const response = await this.api.get<Booking>(API_ENDPOINTS.BOOKINGS.GET_BY_ID(id));
    return response.data;
  }

  async getBookingsByUser(userId: number): Promise<Booking[]> {
    const response = await this.api.get<Booking[]>(
      API_ENDPOINTS.BOOKINGS.GET_BY_USER(userId)
    );
    return response.data;
  }
}

export const apiService = new ApiService();


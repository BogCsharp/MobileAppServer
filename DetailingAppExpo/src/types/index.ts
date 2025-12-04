export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  message: string;
  token?: string;
  refreshToken?: string;
  user?: User;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthday?: Date;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: number;
}

export interface CartItem {
  id: number;
  serviceId: number;
  service: Service;
  quantity: number;
  price: number;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount: number;
}

export interface Order {
  id: number;
  userId: number;
  carId: number;
  employeeId?: number;
  status: OrderStatus;
  totalAmount: number;
  finalAmount: number;
  discountAmount: number;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: number;
  serviceId: number;
  service: Service;
  quantity: number;
  price: number;
}

export enum OrderStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
}

export interface Booking {
  id: number;
  userId: number;
  carId: number;
  employeeId?: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalDurationMinutes: number;
  notes?: string;
  orderId?: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface CreateBookingDTO {
  userId: number;
  carId: number;
  employeeId?: number;
  bookingDate: string;
  startTime: string;
  totalDurationMinutes: number;
  notes?: string;
  orderId?: number;
}


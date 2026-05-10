export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  roleId?: number;
  roleName?: string;
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
  duration: number; // в минутах
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
  Confirmed = 'Confirmed',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Paid = 'Paid',
}

export interface EmployeeProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  isActive: boolean;
  userId?: number;
}

export interface EmployeeEarnings {
  employeeId?: number;
  employeeName: string;
  completedOrdersCount: number;
  totalOrderAmount: number;
  earnings: number;
}

export interface EmployeeSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  isActive: boolean;
  userId?: number;
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

export interface Car {
  id: number;
  brand: string;
  model: string;
  year: string;
  color: string;
  carNumber: string;
  userId: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCarDTO {
  brand: string;
  model: string;
  year: string;
  color: string;
  carNumber: string;
  userId: number;
}


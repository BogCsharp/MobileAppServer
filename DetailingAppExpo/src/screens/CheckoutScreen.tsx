import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { CartItem, TimeSlot } from '../types';

interface CheckoutScreenProps {
  navigation: any;
}

const DAYS_TO_SHOW = 7;

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = (date: Date) => {
  return date.toLocaleDateString('ru-RU', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const getSlotLabel = (slot: TimeSlot) => `${slot.startTime} - ${slot.endTime}`;

export const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const dateOptions = useMemo(() => {
    const today = new Date();
    return Array.from({ length: DAYS_TO_SHOW }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      return {
        key: formatDateKey(date),
        label: formatDateLabel(date),
      };
    });
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(
    () => dateOptions[0]?.key || formatDateKey(new Date())
  );

  const serviceIdsForBooking = useMemo(() => {
    const ids: number[] = [];
    cartItems.forEach((item) => {
      const qty = Math.max(item.quantity || 1, 1);
      for (let i = 0; i < qty; i++) {
        ids.push(item.serviceId);
      }
    });
    return ids;
  }, [cartItems]);

  const getDurationFromSlot = (slot: TimeSlot) => {
    const [startHour, startMinute] = slot.startTime.split(':').map(Number);
    const [endHour, endMinute] = slot.endTime.split(':').map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    return Math.max(end - start, 0);
  };

  useEffect(() => {
    if (!user) return;
    loadCart();
  }, [user]);

  useEffect(() => {
    if (cartItems.length === 0 || !selectedDate) return;
    fetchSlots(selectedDate);
  }, [cartItems, selectedDate, serviceIdsForBooking]);

  const loadCart = async () => {
    if (!user) return;
    setCartLoading(true);
    try {
      const cart = await apiService.getCart(user.id);
      setCartItems(cart.items || []);
    } catch (error) {
      console.error('Checkout loadCart error', error);
      Alert.alert('Ошибка', 'Не удалось загрузить корзину');
    } finally {
      setCartLoading(false);
    }
  };

  const fetchSlots = async (date: string) => {
    if (!user) return;
    if (serviceIdsForBooking.length === 0) {
      setAvailableSlots([]);
      return;
    }
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const slots = await apiService.getAvailableSlots(date, serviceIdsForBooking);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Checkout fetchSlots error', error);
      Alert.alert('Ошибка', 'Не удалось загрузить доступные слоты');
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmitOrder = async () => {
    if (!user) {
      Alert.alert('Ошибка', 'Необходимо войти в систему');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Ошибка', 'Корзина пуста');
      return;
    }

    if (!selectedSlot) {
      Alert.alert('Ошибка', 'Выберите временной слот');
      return;
    }

    setSubmitting(true);
    try {
      const totalDurationMinutes = getDurationFromSlot(selectedSlot);
      if (totalDurationMinutes <= 0) {
        throw new Error('Не удалось определить длительность услуг');
      }

      await apiService.createBooking({
        userId: user.id,
        carId: 1,
        bookingDate: selectedDate,
        startTime: selectedSlot.startTime,
        totalDurationMinutes,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Успех', 'Бронирование подтверждено', [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Orders' } }],
            }),
        },
      ]);
    } catch (error: any) {
      console.error('Checkout submit error', error);
      Alert.alert('Ошибка', error.message || 'Не удалось оформить заказ');
    } finally {
      setSubmitting(false);
    }
  };

  const renderCartItem = (item: CartItem) => {
    const serviceName =
      item.service?.name ||
      (item as any)?.serviceName ||
      `Услуга #${item.serviceId}`;
    const servicePrice =
      item.price ?? item.service?.price ?? 0;

    return (
      <View key={item.id} style={styles.cartItem}>
        <View style={styles.cartItemInfo}>
          <Text style={styles.cartItemName}>{serviceName}</Text>
          <Text style={styles.cartItemPrice}>{servicePrice.toFixed(0)} ₽</Text>
        </View>
        <Text style={styles.cartItemQty}>x{item.quantity}</Text>
      </View>
    );
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.price ?? item.service?.price ?? 0) * item.quantity,
    0
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Для оформления заказа необходимо войти</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.primaryButtonText}>Войти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cartLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Корзина пуста</Text>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs', params: { screen: 'Home' } }],
            })
          }
        >
          <Text style={styles.primaryButtonText}>Перейти к услугам</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Оформление заказа</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ваши услуги</Text>
        {cartItems.map(renderCartItem)}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Итого</Text>
          <Text style={styles.totalValue}>{totalAmount.toFixed(0)} ₽</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Выберите дату</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {dateOptions.map((dateOption) => {
            const isActive = selectedDate === dateOption.key;
            return (
              <TouchableOpacity
                key={dateOption.key}
                style={[
                  styles.dateButton,
                  isActive && styles.dateButtonActive,
                ]}
                onPress={() => setSelectedDate(dateOption.key)}
              >
                <Text
                  style={[
                    styles.dateButtonText,
                    isActive && styles.dateButtonTextActive,
                  ]}
                >
                  {dateOption.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Доступные временные слоты</Text>
        {slotsLoading ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : availableSlots.length === 0 ? (
          <Text style={styles.emptyText}>
            Нет доступных слотов на выбранную дату
          </Text>
        ) : (
          <View style={styles.slotsContainer}>
            {availableSlots.map((slot) => {
              const isSelected =
                selectedSlot?.startTime === slot.startTime &&
                selectedSlot?.endTime === slot.endTime;
              return (
                <TouchableOpacity
                  key={`${slot.startTime}-${slot.endTime}`}
                  style={[
                    styles.slotButton,
                    isSelected && styles.slotButtonActive,
                  ]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text
                    style={[
                      styles.slotButtonText,
                      isSelected && styles.slotButtonTextActive,
                    ]}
                  >
                    {getSlotLabel(slot)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Примечание</Text>
        <TextInput
          style={styles.notesInput}
          placeholder="Дополнительная информация..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, submitting && styles.buttonDisabled]}
        onPress={handleSubmitOrder}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>Подтвердить заказ</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cartItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cartItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  cartItemQty: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#666',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  dateButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 10,
  },
  dateButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dateButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  dateButtonTextActive: {
    color: '#fff',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slotButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  slotButtonActive: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  slotButtonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  slotButtonTextActive: {
    color: '#fff',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});



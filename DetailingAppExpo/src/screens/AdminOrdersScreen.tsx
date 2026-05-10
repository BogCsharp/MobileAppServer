import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiService } from '../services/api';
import { Order, OrderStatus } from '../types';

const STATUSES: OrderStatus[] = [
  OrderStatus.Pending,
  OrderStatus.Confirmed,
  OrderStatus.InProgress,
  OrderStatus.Completed,
  OrderStatus.Cancelled,
  OrderStatus.Paid,
];

const statusText = (status: OrderStatus) => status;

export const AdminOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  const load = async () => {
    try {
      const data = await apiService.getAllOrders();
      setOrders(data);
    } catch {
      Alert.alert('Ошибка', 'Не удалось загрузить заказы');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (orderId: number, status: OrderStatus) => {
    try {
      const updated = await apiService.updateOrderStatusAsAdmin(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        'Не удалось изменить статус';
      Alert.alert('Ошибка', message);
    }
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={orders}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>Заказ #{item.id}</Text>
          <Text>Текущий статус: {statusText(item.status)}</Text>
          <Text>Сумма: {item.finalAmount} ₽</Text>
          <View style={styles.row}>
            {STATUSES.map((status) => (
              <TouchableOpacity
                key={status}
                style={[styles.statusButton, item.status === status && styles.statusButtonActive]}
                onPress={() => updateStatus(item.id, status)}
              >
                <Text style={[styles.statusText, item.status === status && styles.statusTextActive]}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16, gap: 10, paddingBottom: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 10, padding: 12 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  statusButton: { borderWidth: 1, borderColor: '#D1D1D6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  statusButtonActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#1C1C1E' },
  statusTextActive: { color: '#FFF' },
});

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

const statusText = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.Pending:
      return 'Ожидает';
    case OrderStatus.Confirmed:
      return 'Подтвержден';
    case OrderStatus.InProgress:
      return 'В работе';
    case OrderStatus.Completed:
      return 'Завершен';
    case OrderStatus.Cancelled:
      return 'Отменен';
    case OrderStatus.Paid:
      return 'Оплачен';
    default:
      return status;
  }
};

export const AdminOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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
      if (updatingId) return;
        setUpdatingId(orderId);
    try {
      const updated = await apiService.updateOrderStatusAsAdmin(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      Alert.alert('Успешно', `Статус изменен: ${statusText(status)}`);
      } catch (error: any) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.Message ||
          (error?.response?.status === 403
            ? 'Нет доступа к изменению этого заказа'
            : 'Не удалось изменить статус');
        Alert.alert('Ошибка', message);
      } finally {
        setUpdatingId(null);
      }
  };

  const filteredOrders =
    statusFilter === 'All'
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={filteredOrders}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, statusFilter === 'All' && styles.filterChipActive]}
            onPress={() => setStatusFilter('All')}
          >
            <Text style={[styles.filterChipText, statusFilter === 'All' && styles.filterChipTextActive]}>Все</Text>
          </TouchableOpacity>
          {STATUSES.map((status) => (
            <TouchableOpacity
              key={`filter-${status}`}
              style={[styles.filterChip, statusFilter === status && styles.filterChipActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={[styles.filterChipText, statusFilter === status && styles.filterChipTextActive]}>
                {statusText(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      }
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
                  {statusText(status)}
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
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  filterChip: { borderWidth: 1, borderColor: '#D1D1D6', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#FFF' },
  filterChipActive: { borderColor: '#007AFF', backgroundColor: '#007AFF' },
  filterChipText: { fontSize: 12, fontWeight: '600', color: '#1C1C1E' },
  filterChipTextActive: { color: '#FFF' },
  statusButton: { borderWidth: 1, borderColor: '#D1D1D6', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5 },
  statusButtonActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  statusText: { fontSize: 11, fontWeight: '600', color: '#1C1C1E' },
  statusTextActive: { color: '#FFF' },
});

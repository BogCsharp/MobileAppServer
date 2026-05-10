import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiService } from '../services/api';
import { Order, OrderStatus } from '../types';

type EmployeeOrderFilter = 'All' | 'Active' | 'Completed' | 'Cancelled';

const STATUS_ACTIONS: OrderStatus[] = [
  OrderStatus.InProgress,
  OrderStatus.Completed,
  OrderStatus.Cancelled,
];

const statusLabel = (status: OrderStatus) => {
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

export const EmployeeOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<EmployeeOrderFilter>('All');

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiService.getMyEmployeeOrders();
      setOrders(data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        'Не удалось загрузить заказы мастера';
      Alert.alert('Ошибка', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const changeStatus = async (orderId: number, status: OrderStatus) => {
    if (updatingId) return;
    setUpdatingId(orderId);
    try {
      const updated = await apiService.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((item) => (item.id === orderId ? updated : item)));
      Alert.alert('Успешно', `Статус изменен: ${statusLabel(status)}`);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        (error?.response?.status === 403
          ? 'Нет доступа к изменению этого заказа'
          : 'Не удалось изменить статус заказа');
      Alert.alert('Ошибка', message);
    } finally {
      setUpdatingId(null);
    }
  };

  const isActiveOrder = (status: OrderStatus) =>
    status === OrderStatus.Pending ||
    status === OrderStatus.Confirmed ||
    status === OrderStatus.InProgress;

  const filteredOrders = orders.filter((order) => {
    switch (selectedFilter) {
      case 'Active':
        return isActiveOrder(order.status);
      case 'Completed':
        return order.status === OrderStatus.Completed || order.status === OrderStatus.Paid;
      case 'Cancelled':
        return order.status === OrderStatus.Cancelled;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={filteredOrders}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View style={styles.filtersContainer}>
          {(['All', 'Active', 'Completed', 'Cancelled'] as EmployeeOrderFilter[]).map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.filterButtonActive,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  selectedFilter === filter && styles.filterButtonTextActive,
                ]}
              >
                {filter === 'All'
                  ? 'Все'
                  : filter === 'Active'
                  ? 'Активные'
                  : filter === 'Completed'
                  ? 'Завершенные'
                  : 'Отмененные'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={
        <Text style={styles.emptyText}>
          {selectedFilter === 'All' ? 'У вас пока нет заказов' : 'По выбранному фильтру заказов нет'}
        </Text>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.orderNumber}>Заказ #{item.id}</Text>
          <Text style={styles.status}>Статус: {statusLabel(item.status)}</Text>
          <Text style={styles.amount}>Сумма: {item.finalAmount} ₽</Text>

          {isActiveOrder(item.status) ? (
            <View style={styles.actions}>
              {STATUS_ACTIONS.map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.actionButton,
                    item.status === status && styles.actionButtonActive,
                  ]}
                  disabled={updatingId === item.id}
                  onPress={() => changeStatus(item.id, status)}
                >
                  <Text
                    style={[
                      styles.actionText,
                      item.status === status && styles.actionTextActive,
                    ]}
                  >
                    {statusLabel(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.readOnlyStatus}>Изменение статуса недоступно</Text>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    flexGrow: 1,
    gap: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterButton: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterButtonText: {
    color: '#3A3A3C',
    fontSize: 13,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  status: {
    marginTop: 8,
    color: '#3A3A3C',
  },
  amount: {
    marginTop: 4,
    color: '#3A3A3C',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  actionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  actionText: {
    color: '#1C1C1E',
    fontSize: 12,
    fontWeight: '600',
  },
  actionTextActive: {
    color: '#FFF',
  },
  emptyText: {
    marginTop: 30,
    textAlign: 'center',
    color: '#8E8E93',
  },
  readOnlyStatus: {
    color: '#8E8E93',
    fontSize: 12,
    fontStyle: 'italic',
  },
});

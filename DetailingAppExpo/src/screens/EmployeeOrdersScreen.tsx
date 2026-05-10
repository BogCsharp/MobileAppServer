import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiService } from '../services/api';
import { Order, OrderStatus } from '../types';

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

  const loadOrders = useCallback(async () => {
    try {
      const data = await apiService.getMyEmployeeOrders();
      setOrders(data);
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
    } finally {
      setUpdatingId(null);
    }
  };

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
      data={orders}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListEmptyComponent={<Text style={styles.emptyText}>У вас пока нет заказов</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.orderNumber}>Заказ #{item.id}</Text>
          <Text style={styles.status}>Статус: {statusLabel(item.status)}</Text>
          <Text style={styles.amount}>Сумма: {item.finalAmount} ₽</Text>

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
});

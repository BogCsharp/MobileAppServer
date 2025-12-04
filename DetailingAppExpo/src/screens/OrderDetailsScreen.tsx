import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { apiService } from '../services/api';
import { Order, OrderStatus } from '../types';

interface OrderDetailsScreenProps {
  route: { params?: { orderId?: number } };
}

export const OrderDetailsScreen: React.FC<OrderDetailsScreenProps> = ({ route }) => {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('Не указан идентификатор заказа');
      setLoading(false);
      return;
    }
    loadOrder(orderId);
  }, [orderId]);

  const loadOrder = async (id: number) => {
    try {
      const data = await apiService.getOrderById(id);
      setOrder(data);
    } catch (e: any) {
      setError(e?.message || 'Не удалось загрузить заказ');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'Ожидает';
      case OrderStatus.InProgress:
        return 'В работе';
      case OrderStatus.Completed:
        return 'Завершен';
      case OrderStatus.Cancelled:
        return 'Отменен';
      default:
        return status;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Completed:
        return '#34C759';
      case OrderStatus.InProgress:
        return '#007AFF';
      case OrderStatus.Cancelled:
        return '#FF3B30';
      default:
        return '#FF9500';
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Заказ не найден'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.orderTitle}>Заказ #{order.id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация о заказе</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Создан:</Text>
          <Text style={styles.value}>{formatDateTime(order.createdAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Завершен:</Text>
          <Text style={styles.value}>{formatDateTime(order.completedAt)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Сумма:</Text>
          <Text style={styles.value}>{order.totalAmount.toFixed(0)} ₽</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Скидка:</Text>
          <Text style={styles.value}>{order.discountAmount.toFixed(0)} ₽</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Итого к оплате:</Text>
          <Text style={[styles.value, styles.totalValue]}>
            {order.finalAmount.toFixed(0)} ₽
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Услуги</Text>
        {order.orderItems?.length ? (
          order.orderItems.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.service?.name}</Text>
                <Text style={styles.itemPrice}>
                  {item.price.toFixed(0)} ₽ × {item.quantity}
                </Text>
              </View>
              <Text style={styles.itemTotal}>
                {(item.price * item.quantity).toFixed(0)} ₽
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.mutedText}>Список услуг пуст</Text>
        )}
      </View>

      {order.notes ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Примечание</Text>
          <Text style={styles.notesText}>{order.notes}</Text>
        </View>
      ) : null}
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
    paddingBottom: 24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  orderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
  },
  totalValue: {
    fontWeight: '700',
    color: '#007AFF',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  mutedText: {
    fontSize: 14,
    color: '#999',
  },
});



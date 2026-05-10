import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Order, OrderStatus } from '../types';

interface OrdersScreenProps {
  navigation: any;
}

type OrderFilter = 'All' | 'Active' | 'Completed' | 'Cancelled';

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation }) => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<OrderFilter>('All');

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const data = await apiService.getOrdersByUser(user.id);
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
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

  const getStatusText = (status: OrderStatus) => {
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

  const canCancelOrder = (status: OrderStatus) =>
    status !== OrderStatus.Completed &&
    status !== OrderStatus.Paid &&
    status !== OrderStatus.Cancelled;

  const filteredOrders = orders.filter((order) => {
    switch (selectedFilter) {
      case 'Active':
        return (
          order.status === OrderStatus.Pending ||
          order.status === OrderStatus.Confirmed ||
          order.status === OrderStatus.InProgress
        );
      case 'Completed':
        return order.status === OrderStatus.Completed || order.status === OrderStatus.Paid;
      case 'Cancelled':
        return order.status === OrderStatus.Cancelled;
      default:
        return true;
    }
  });

  const cancelOrder = (orderId: number) => {
    Alert.alert('Отмена заказа', 'Вы уверены, что хотите отменить этот заказ?', [
      { text: 'Нет', style: 'cancel' },
      {
        text: 'Отменить',
        style: 'destructive',
        onPress: async () => {
          try {
            const updated = await apiService.cancelOrderByClient(orderId);
            setOrders((prev) => prev.map((item) => (item.id === orderId ? updated : item)));
            Alert.alert('Готово', 'Заказ отменен');
          } catch (error: any) {
            const message =
              error?.response?.data?.message ||
              error?.response?.data?.Message ||
              'Не удалось отменить заказ';
            Alert.alert('Ошибка', message);
          }
        },
      },
    ]);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderOrder = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>Заказ #{item.id}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <Text style={styles.orderDate}>
        {formatDate(item.createdAt)}
      </Text>
      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>
          {item.finalAmount.toFixed(0)} ₽
        </Text>
        <Text style={styles.orderItems}>
          {item.orderItems?.length || 0} {item.orderItems?.length === 1 ? 'услуга' : 'услуг'}
        </Text>
      </View>
      {canCancelOrder(item.status) && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => cancelOrder(item.id)}
        >
          <Text style={styles.cancelButtonText}>Отменить заказ</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Для просмотра заказов необходимо войти в систему</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.browseButtonText}>Войти</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filtersContainer}>
        {(['All', 'Active', 'Completed', 'Cancelled'] as OrderFilter[]).map((filter) => (
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
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedFilter === 'All'
                ? 'У вас пока нет заказов'
                : 'По выбранному фильтру заказов нет'}
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.browseButtonText}>Посмотреть услуги</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
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
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '600',
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
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  orderItems: {
    fontSize: 14,
    color: '#999',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
  },
});


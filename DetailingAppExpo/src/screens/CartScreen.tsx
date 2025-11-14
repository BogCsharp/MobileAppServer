import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { CartItem } from '../types';

interface CartScreenProps {
  navigation: any;
}

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadCart = async () => {
    if (!user) return;
    try {
      const cart = await apiService.getCart(user.id);
      setCartItems(cart.items || []);
      setTotal(cart.totalAmount || 0);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    if (!user) return;
    if (newQuantity < 1) {
      await removeItem(item);
      return;
    }
    try {
      await apiService.updateCartItem(user.id, item.id, newQuantity);
      await loadCart();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось обновить количество');
    }
  };

  const removeItem = async (item: CartItem) => {
    if (!user) return;
    Alert.alert(
      'Удалить товар',
      'Вы уверены, что хотите удалить этот товар из корзины?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.removeFromCart(user.id, item.id);
              await loadCart();
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить товар');
            }
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;

    Alert.alert(
      'Оформить заказ',
      `Итого: ${total.toFixed(0)} ₽\n\nПродолжить?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Оформить',
          onPress: async () => {
            setProcessing(true);
            try {
              await apiService.createOrderFromCart({
                userId: user.id,
                carId: 1, // TODO: добавить выбор машины
              });
              Alert.alert('Успех', 'Заказ успешно оформлен!', [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('Orders');
                    loadCart();
                  },
                },
              ]);
            } catch (error: any) {
              Alert.alert('Ошибка', error.message || 'Не удалось оформить заказ');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.service.name}</Text>
        <Text style={styles.itemPrice}>{item.price.toFixed(0)} ₽</Text>
      </View>
      <View style={styles.itemActions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item, item.quantity - 1)}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item, item.quantity + 1)}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeItem(item)}
        >
          <Text style={styles.removeButtonText}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Корзина пуста</Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Посмотреть услуги</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
          />
          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Итого:</Text>
              <Text style={styles.totalAmount}>{total.toFixed(0)} ₽</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutButton, processing && styles.buttonDisabled]}
              onPress={handleCheckout}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.checkoutButtonText}>Оформить заказ</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
  },
  itemCard: {
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
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButtonText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
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
});


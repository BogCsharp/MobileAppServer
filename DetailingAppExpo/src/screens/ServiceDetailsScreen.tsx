import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Service } from '../types';

interface ServiceDetailsScreenProps {
  route: any;
  navigation: any;
}

export const ServiceDetailsScreen: React.FC<ServiceDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { service } = route.params;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      Alert.alert('Ошибка', 'Необходимо войти в систему');
      navigation.navigate('Login');
      return;
    }

    setLoading(true);
    try {
      await apiService.addToCart(user.id, service.id, 1);
      Alert.alert('Успех', 'Услуга добавлена в корзину', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Cart'),
        },
        {
          text: 'Продолжить покупки',
          style: 'cancel',
        },
      ]);
    } catch (error: any) {
      Alert.alert('Ошибка', error.message || 'Не удалось добавить в корзину');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{service.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{service.price.toFixed(0)} ₽</Text>
          <Text style={styles.duration}>{service.duration} минут</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Описание</Text>
          <Text style={styles.description}>{service.description}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, loading && styles.buttonDisabled]}
          onPress={handleAddToCart}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Добавить в корзину</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  duration: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  addButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


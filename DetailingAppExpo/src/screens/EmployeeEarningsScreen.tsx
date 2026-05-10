import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { apiService } from '../services/api';
import { EmployeeEarnings } from '../types';

const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

export const EmployeeEarningsScreen: React.FC = () => {
  const [data, setData] = useState<EmployeeEarnings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const range = getCurrentMonthRange();
      const report = await apiService.getMyEmployeeEarnings(range.startDate, range.endDate);
      setData(report);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Зарплата за текущий месяц</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Мастер</Text>
        <Text style={styles.value}>{data?.employeeName || 'Мастер'}</Text>

        <Text style={styles.label}>Завершенных заказов</Text>
        <Text style={styles.value}>{data?.completedOrdersCount ?? 0}</Text>

        <Text style={styles.label}>Сумма заказов</Text>
        <Text style={styles.value}>{data?.totalOrderAmount ?? 0} ₽</Text>

        <Text style={styles.label}>Начисление (30%)</Text>
        <Text style={styles.salary}>{data?.earnings ?? 0} ₽</Text>
      </View>

      <TouchableOpacity style={styles.refreshButton} onPress={load}>
        <Text style={styles.refreshText}>Обновить</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
  },
  label: {
    color: '#6C6C70',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  salary: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  refreshText: {
    color: '#FFF',
    fontWeight: '700',
  },
});

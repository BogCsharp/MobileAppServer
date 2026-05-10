import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { apiService } from '../services/api';
import { EmployeeEarnings } from '../types';

export const EmployeeEarningsScreen: React.FC = () => {
  const [data, setData] = useState<EmployeeEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);

  const load = async (rangeStart = startDate, rangeEnd = endDate) => {
    setLoading(true);
    try {
      const report = await apiService.getMyEmployeeEarnings(
        rangeStart.toISOString(),
        rangeEnd.toISOString()
      );
      setData(report);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        'Не удалось получить расчет зарплаты';
      Alert.alert('Ошибка', message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setPickerTarget(null);
    }

    if (event.type !== 'set' || !selectedDate || !pickerTarget) {
      return;
    }

    if (pickerTarget === 'start') {
      if (selectedDate > endDate) {
        Alert.alert('Ошибка', 'Дата начала не может быть позже даты окончания');
        return;
      }
      setStartDate(selectedDate);
      return;
    }

    if (selectedDate < startDate) {
      Alert.alert('Ошибка', 'Дата окончания не может быть раньше даты начала');
      return;
    }
    setEndDate(selectedDate);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Расчет зарплаты</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Период расчета</Text>
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateButton} onPress={() => setPickerTarget('start')}>
            <Text style={styles.dateButtonText}>С: {formatDate(startDate)}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dateButton} onPress={() => setPickerTarget('end')}>
            <Text style={styles.dateButtonText}>По: {formatDate(endDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {pickerTarget && (
        <DateTimePicker
          value={pickerTarget === 'start' ? startDate : endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
          maximumDate={new Date()}
        />
      )}

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

      <TouchableOpacity style={styles.refreshButton} onPress={() => load(startDate, endDate)}>
        <Text style={styles.refreshText}>Рассчитать</Text>
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
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dateButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#1C1C1E',
    fontWeight: '600',
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

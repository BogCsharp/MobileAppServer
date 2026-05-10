import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { apiService } from '../services/api';
import { EmployeeEarnings, EmployeeSummary } from '../types';

export const AdminPayrollScreen: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [rows, setRows] = useState<EmployeeEarnings[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(null);

  const loadEmployees = async () => {
    try {
      const data = await apiService.getEmployees();
      setEmployees(data);
    } catch {
      Alert.alert('Ошибка', 'Не удалось загрузить мастеров');
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const calcAll = async () => {
    try {
      const report = await Promise.all(
        employees.map((employee) =>
          apiService.getEmployeeEarningsForAdmin(
            employee.id,
            startDate.toISOString(),
            endDate.toISOString()
          )
        )
      );
      setRows(report);
    } catch {
      Alert.alert('Ошибка', 'Не удалось рассчитать зарплату');
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setPickerTarget(null);
    }
    if (event.type !== 'set' || !selectedDate || !pickerTarget) return;
    if (pickerTarget === 'start') setStartDate(selectedDate);
    if (pickerTarget === 'end') setEndDate(selectedDate);
  };

  const total = rows.reduce((acc, row) => acc + row.earnings, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>ЗП всех мастеров</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.dateButton} onPress={() => setPickerTarget('start')}>
          <Text>С: {startDate.toLocaleDateString('ru-RU')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.dateButton} onPress={() => setPickerTarget('end')}>
          <Text>По: {endDate.toLocaleDateString('ru-RU')}</Text>
        </TouchableOpacity>
      </View>
      {pickerTarget && (
        <DateTimePicker
          value={pickerTarget === 'start' ? startDate : endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onChangeDate}
        />
      )}
      <TouchableOpacity style={styles.primaryButton} onPress={calcAll}>
        <Text style={styles.primaryText}>Рассчитать всем</Text>
      </TouchableOpacity>

      {rows.map((row) => (
        <View style={styles.card} key={String(row.employeeId)}>
          <Text style={styles.cardTitle}>{row.employeeName}</Text>
          <Text>Заказов: {row.completedOrdersCount}</Text>
          <Text>Оборот: {row.totalOrderAmount} ₽</Text>
          <Text style={styles.salary}>ЗП: {row.earnings} ₽</Text>
        </View>
      ))}

      <View style={styles.totalCard}>
        <Text style={styles.totalText}>Итого ЗП: {total} ₽</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16, gap: 10, paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E' },
  row: { flexDirection: 'row', gap: 8 },
  dateButton: { flex: 1, backgroundColor: '#FFF', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  primaryButton: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  primaryText: { color: '#FFF', fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderRadius: 10, padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  salary: { marginTop: 6, color: '#34C759', fontWeight: '700' },
  totalCard: { backgroundColor: '#1C1C1E', borderRadius: 10, padding: 12 },
  totalText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});

import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { apiService } from '../services/api';
import { Car, Service, TimeSlot } from '../types';

export const AdminClientsScreen: React.FC = () => {
  const [registrationModalVisible, setRegistrationModalVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [registrationRoleId, setRegistrationRoleId] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [clientSearchResult, setClientSearchResult] = useState<Array<{ id: number; email: string; firstName?: string; lastName?: string; phone?: string }>>([]);
  const [selectedClientEmail, setSelectedClientEmail] = useState('');
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carYear, setCarYear] = useState('');
  const [carColor, setCarColor] = useState('');
  const [carNumber, setCarNumber] = useState('');

  const [employeeId, setEmployeeId] = useState('');
  const [notes, setNotes] = useState('');

  const bookingDate = useMemo(() => selectedDate.toISOString().slice(0, 10), [selectedDate]);
  const totalDurationMinutes = useMemo(
    () =>
      selectedServiceIds.reduce((acc, id) => {
        const service = services.find((s) => s.id === id);
        return acc + (service?.duration ?? 0);
      }, 0),
    [selectedServiceIds, services]
  );

  useEffect(() => {
    (async () => {
      try {
        const allServices = await apiService.getServices();
        setServices(allServices);
      } catch {
        Alert.alert('Ошибка', 'Не удалось загрузить услуги');
      }
    })();
  }, []);

  useEffect(() => {
    const loadSlots = async () => {
      if (selectedServiceIds.length === 0) {
        setAvailableSlots([]);
        setSelectedSlot(null);
        return;
      }
      try {
        const slots = await apiService.getAvailableSlots(bookingDate, selectedServiceIds);
        const freeSlots = slots.filter((slot) => slot.isAvailable);
        setAvailableSlots(freeSlots);
        setSelectedSlot(null);
      } catch {
        Alert.alert('Ошибка', 'Не удалось загрузить доступные слоты');
      }
    };
    loadSlots();
  }, [selectedServiceIds, bookingDate]);

  const loadCarsForClient = async (clientId: number) => {
    const userCars = await apiService.getCarsByUser(clientId);
    setCars(userCars);
    setSelectedCarId(userCars[0]?.id ?? null);
  };

  const searchClientByEmail = async () => {
    if (!searchEmail.trim()) {
      Alert.alert('Ошибка', 'Введите email для поиска');
      return;
    }
    try {
      const users = await apiService.searchClientsByEmail(searchEmail.trim());
      setClientSearchResult(users);
      if (users.length === 0) {
        Alert.alert('Инфо', 'Клиенты не найдены');
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось выполнить поиск клиента');
    }
  };

  const selectClient = async (id: number) => {
    setSelectedClientId(id);
    const selected = clientSearchResult.find((client) => client.id === id);
    setSelectedClientEmail(selected?.email || '');
    setCars([]);
    setSelectedCarId(null);
    await loadCarsForClient(id);
  };

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const registerClient = async (): Promise<number | null> => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Email и пароль обязательны');
      return null;
    }

    setLoading(true);
    try {
      const response = await apiService.registerByAdmin({
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword: password,
        roleId: registrationRoleId,
      });
      const createdUserId = response.user?.id;
      if (createdUserId) {
        setSelectedClientId(createdUserId);
        setSelectedClientEmail(response.user?.email || '');
        await loadCarsForClient(createdUserId);
        setSearchEmail(response.user?.email || '');
      }
      Alert.alert('Успешно', 'Клиент зарегистрирован');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setRegistrationRoleId(1);
      return createdUserId ?? null;
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        error?.message ||
        'Не удалось зарегистрировать клиента';
      Alert.alert('Ошибка', message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCarForClient = async () => {
    if (!selectedClientId) {
      Alert.alert('Ошибка', 'Сначала создайте клиента или укажите Client ID');
      return;
    }
    if (!carBrand || !carModel || !carYear || !carColor || !carNumber) {
      Alert.alert('Ошибка', 'Заполните все поля авто');
      return;
    }

    try {
      await apiService.createCar({
        brand: carBrand,
        model: carModel,
        year: carYear,
        color: carColor,
        carNumber,
        userId: selectedClientId,
      });
      await loadCarsForClient(selectedClientId);
      setCarBrand('');
      setCarModel('');
      setCarYear('');
      setCarColor('');
      setCarNumber('');
      Alert.alert('Успешно', 'Авто добавлено клиенту');
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось добавить авто');
    }
  };

  const createBookingAndOrder = async () => {
    if (!selectedClientId) {
      Alert.alert('Ошибка', 'Укажите Client ID');
      return;
    }
    if (!selectedCarId) {
      Alert.alert('Ошибка', 'Выберите авто клиента');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Ошибка', 'Выберите слот');
      return;
    }
    if (selectedServiceIds.length === 0) {
      Alert.alert('Ошибка', 'Выберите хотя бы одну услугу');
      return;
    }

    try {
      await apiService.clearCart(selectedClientId);
      for (const serviceId of selectedServiceIds) {
        await apiService.addToCart(selectedClientId, serviceId, 1);
      }

      const created = await apiService.createBooking({
        userId: selectedClientId,
        carId: selectedCarId,
        bookingDate,
        startTime: selectedSlot.startTime,
        totalDurationMinutes,
        employeeId: employeeId ? Number(employeeId) : undefined,
        notes: notes || undefined,
      });
      Alert.alert(
        'Успешно',
        `Бронирование создано (ID: ${created.id})\nЗаказ создан (ID: ${created.orderId ?? '-'})`
      );
      setSelectedServiceIds([]);
      setSelectedSlot(null);
      setAvailableSlots([]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        error?.message ||
        'Не удалось создать бронирование';
      Alert.alert('Ошибка', message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Бронирование клиента</Text>
        <TouchableOpacity style={styles.addClientButton} onPress={() => setRegistrationModalVisible(true)}>
          <Text style={styles.addClientButtonText}>+ Клиент</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Клиент для бронирования</Text>
        <TextInput
          style={styles.input}
          placeholder="Поиск клиента по email"
          value={searchEmail}
          onChangeText={setSearchEmail}
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.secondaryButton} onPress={searchClientByEmail}>
          <Text style={styles.secondaryButtonText}>Найти клиента</Text>
        </TouchableOpacity>
        {clientSearchResult.length > 0 && (
          <View style={styles.tagsRow}>
            {clientSearchResult.map((client) => (
              <TouchableOpacity
                key={client.id}
                style={[styles.tag, selectedClientId === client.id && styles.tagActive]}
                onPress={() => selectClient(client.id)}
              >
                <Text style={[styles.tagText, selectedClientId === client.id && styles.tagTextActive]}>
                  #{client.id} {client.email}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TextInput
          style={styles.input}
          placeholder="Client ID"
          value={selectedClientId ? String(selectedClientId) : ''}
          onChangeText={(value) => setSelectedClientId(value ? Number(value) : null)}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={async () => {
            if (!selectedClientId) return;
            try {
              await loadCarsForClient(selectedClientId);
            } catch {
              Alert.alert('Ошибка', 'Не удалось загрузить авто клиента');
            }
          }}
        >
          <Text style={styles.secondaryButtonText}>Загрузить авто клиента</Text>
        </TouchableOpacity>
        {!!selectedClientEmail && (
          <Text style={styles.helperText}>Выбран: {selectedClientEmail}</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Выбор услуг и авто</Text>
        <Text style={styles.sectionSubtitle}>Выберите услуги клиента</Text>
        <View style={styles.tagsRow}>
          {services.map((service) => {
            const active = selectedServiceIds.includes(service.id);
            return (
              <TouchableOpacity
                key={service.id}
                style={[styles.tag, active && styles.tagActive]}
                onPress={() => toggleService(service.id)}
              >
                <Text style={[styles.tagText, active && styles.tagTextActive]}>
                  {service.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.helperText}>Суммарная длительность: {totalDurationMinutes} мин</Text>

        <Text style={styles.sectionSubtitle}>Авто клиента</Text>
        {cars.length > 0 ? (
          <View style={styles.tagsRow}>
            {cars.map((car) => (
              <TouchableOpacity
                key={car.id}
                style={[styles.tag, selectedCarId === car.id && styles.tagActive]}
                onPress={() => setSelectedCarId(car.id)}
              >
                <Text style={[styles.tagText, selectedCarId === car.id && styles.tagTextActive]}>
                  #{car.id} {car.brand} {car.model}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.helperText}>Сначала найдите клиента и загрузите его авто</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Создать бронирование и заказ</Text>

        <Text style={styles.sectionSubtitle}>Дата</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.secondaryButtonText}>{selectedDate.toLocaleDateString('ru-RU')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              if (Platform.OS === 'android') setShowDatePicker(false);
              if (event.type === 'set' && date) setSelectedDate(date);
            }}
            minimumDate={new Date()}
          />
        )}

        <Text style={styles.sectionSubtitle}>Доступные слоты</Text>
        <View style={styles.tagsRow}>
          {availableSlots.length > 0 ? (
            availableSlots.map((slot) => {
              const active = selectedSlot?.startTime === slot.startTime && selectedSlot?.endTime === slot.endTime;
              return (
                <TouchableOpacity
                  key={`${slot.startTime}-${slot.endTime}`}
                  style={[styles.tag, active && styles.tagActive]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>
                    {slot.startTime} - {slot.endTime}
                  </Text>
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.helperText}>Нет слотов. Выберите услуги/дату.</Text>
          )}
        </View>

        <TextInput style={styles.input} placeholder="ID мастера (необязательно)" value={employeeId} onChangeText={setEmployeeId} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Комментарий" value={notes} onChangeText={setNotes} />
        <TouchableOpacity style={styles.button} onPress={createBookingAndOrder}>
          <Text style={styles.buttonText}>Создать бронирование</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={registrationModalVisible} transparent animationType="slide" onRequestClose={() => setRegistrationModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Новый клиент + авто</Text>
            <TextInput style={styles.input} placeholder="Имя" value={firstName} onChangeText={setFirstName} />
            <TextInput style={styles.input} placeholder="Фамилия" value={lastName} onChangeText={setLastName} />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Телефон" value={phone} onChangeText={setPhone} />
            <TextInput style={styles.input} placeholder="Пароль" value={password} onChangeText={setPassword} secureTextEntry />
            <Text style={styles.sectionSubtitle}>Роль нового пользователя</Text>
            <View style={styles.tagsRow}>
              <TouchableOpacity
                style={[styles.tag, registrationRoleId === 1 && styles.tagActive]}
                onPress={() => setRegistrationRoleId(1)}
              >
                <Text style={[styles.tagText, registrationRoleId === 1 && styles.tagTextActive]}>Клиент (roleId=1)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tag, registrationRoleId === 2 && styles.tagActive]}
                onPress={() => setRegistrationRoleId(2)}
              >
                <Text style={[styles.tagText, registrationRoleId === 2 && styles.tagTextActive]}>Мастер (roleId=2)</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionSubtitle}>Авто (опционально)</Text>
            <TextInput style={styles.input} placeholder="Марка" value={carBrand} onChangeText={setCarBrand} />
            <TextInput style={styles.input} placeholder="Модель" value={carModel} onChangeText={setCarModel} />
            <TextInput style={styles.input} placeholder="Год" value={carYear} onChangeText={setCarYear} />
            <TextInput style={styles.input} placeholder="Цвет" value={carColor} onChangeText={setCarColor} />
            <TextInput style={styles.input} placeholder="Номер" value={carNumber} onChangeText={setCarNumber} />
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setRegistrationModalVisible(false)}>
                <Text style={styles.modalCancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalPrimaryButton}
                onPress={async () => {
                  const createdClientId = await registerClient();
                  if (
                    createdClientId &&
                    registrationRoleId === 1 &&
                    carBrand &&
                    carModel &&
                    carYear &&
                    carColor &&
                    carNumber
                  ) {
                    await apiService.createCar({
                      brand: carBrand,
                      model: carModel,
                      year: carYear,
                      color: carColor,
                      carNumber,
                      userId: createdClientId,
                    });
                    await loadCarsForClient(createdClientId);
                    setCarBrand('');
                    setCarModel('');
                    setCarYear('');
                    setCarColor('');
                    setCarNumber('');
                  }
                  setRegistrationModalVisible(false);
                }}
                disabled={loading}
              >
                <Text style={styles.modalPrimaryButtonText}>{loading ? 'Сохранение...' : 'Сохранить'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  content: { padding: 16, gap: 10, paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addClientButton: { backgroundColor: '#1C1C1E', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  addClientButtonText: { color: '#FFF', fontWeight: '700' },
  input: { backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  button: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: '700' },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 12, gap: 8, marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  sectionSubtitle: { fontSize: 14, fontWeight: '600', color: '#3A3A3C' },
  secondaryButton: { borderWidth: 1, borderColor: '#007AFF', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  secondaryButtonText: { color: '#007AFF', fontWeight: '700' },
  helperText: { color: '#6C6C70' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { borderWidth: 1, borderColor: '#D1D1D6', borderRadius: 14, paddingVertical: 6, paddingHorizontal: 10 },
  tagActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  tagText: { color: '#1C1C1E', fontSize: 12, fontWeight: '600' },
  tagTextActive: { color: '#FFF' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#F2F2F7', borderRadius: 12, padding: 12, gap: 8, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  modalButtonsRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  modalCancelButton: { flex: 1, borderWidth: 1, borderColor: '#D1D1D6', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  modalCancelButtonText: { color: '#3A3A3C', fontWeight: '700' },
  modalPrimaryButton: { flex: 1, backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  modalPrimaryButtonText: { color: '#FFF', fontWeight: '700' },
});

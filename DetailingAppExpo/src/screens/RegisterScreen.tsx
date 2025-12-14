import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { RegisterDTO } from '../types';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() - 25);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  // Генерируем списки для выбора
  const days = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [selectedYear, selectedMonth]);

  const months = useMemo(() => {
    return [
      { value: 1, label: 'Январь' },
      { value: 2, label: 'Февраль' },
      { value: 3, label: 'Март' },
      { value: 4, label: 'Апрель' },
      { value: 5, label: 'Май' },
      { value: 6, label: 'Июнь' },
      { value: 7, label: 'Июль' },
      { value: 8, label: 'Август' },
      { value: 9, label: 'Сентябрь' },
      { value: 10, label: 'Октябрь' },
      { value: 11, label: 'Ноябрь' },
      { value: 12, label: 'Декабрь' },
    ];
  }, []);

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 1900;
    return Array.from({ length: currentYear - startYear + 1 }, (_, i) => currentYear - i);
  }, []);

  const handleOpenCustomPicker = () => {
    if (birthday) {
      setSelectedDay(birthday.getDate());
      setSelectedMonth(birthday.getMonth() + 1);
      setSelectedYear(birthday.getFullYear());
    }
    setShowCustomPicker(true);
  };

  const handleConfirmCustomDate = () => {
    const newDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    if (newDate > new Date()) {
      Alert.alert('Ошибка', 'Дата рождения не может быть в будущем');
      return;
    }
    setBirthday(newDate);
    setShowCustomPicker(false);
  };

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Ошибка', 'Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен содержать минимум 6 символов');
      return;
    }

    setLoading(true);
    try {
      await register({ 
        email, 
        password, 
        confirmPassword, 
        firstName, 
        lastName,
        phone: phone || undefined,
        birthday: birthday || undefined
      });
      Alert.alert('Успех', 'Регистрация прошла успешно! Теперь войдите в систему.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Ошибка регистрации', error.message || 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Регистрация</Text>
          <Text style={styles.subtitle}>Создайте новый аккаунт</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите имя"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Фамилия</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите фамилию"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Номер телефона</Text>
            <TextInput
              style={styles.input}
              placeholder="+7 (999) 999-99-99"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Дата рождения</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={handleOpenCustomPicker}
            >
              <Text style={[styles.dateInputText, !birthday && styles.dateInputPlaceholder]}>
                {birthday
                  ? birthday.toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    })
                  : 'Выберите дату рождения'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Кастомный модальный datepicker */}
          <Modal
            visible={showCustomPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCustomPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Выберите дату рождения</Text>
                
                <View style={styles.pickerContainer}>
                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>День</Text>
                    <ScrollView style={styles.pickerScrollView}>
                      {days.map((day) => (
                        <TouchableOpacity
                          key={day}
                          style={[
                            styles.pickerOption,
                            selectedDay === day && styles.pickerOptionSelected,
                          ]}
                          onPress={() => setSelectedDay(day)}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              selectedDay === day && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>Месяц</Text>
                    <ScrollView style={styles.pickerScrollView}>
                      {months.map((month) => (
                        <TouchableOpacity
                          key={month.value}
                          style={[
                            styles.pickerOption,
                            selectedMonth === month.value && styles.pickerOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedMonth(month.value);
                            // Проверяем, что выбранный день существует в новом месяце
                            const daysInNewMonth = new Date(selectedYear, month.value, 0).getDate();
                            if (selectedDay > daysInNewMonth) {
                              setSelectedDay(daysInNewMonth);
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              selectedMonth === month.value && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {month.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>Год</Text>
                    <View style={styles.yearInputContainer}>
                      <TextInput
                        style={styles.yearInput}
                        value={selectedYear.toString()}
                        onChangeText={(text) => {
                          const year = parseInt(text, 10);
                          if (!isNaN(year) && year >= 1900 && year <= new Date().getFullYear()) {
                            setSelectedYear(year);
                            // Проверяем, что выбранный день существует в новом году (для 29 февраля)
                            const daysInMonth = new Date(year, selectedMonth, 0).getDate();
                            if (selectedDay > daysInMonth) {
                              setSelectedDay(daysInMonth);
                            }
                          }
                        }}
                        keyboardType="numeric"
                        maxLength={4}
                        placeholder="Год"
                      />
                    </View>
                    <ScrollView style={styles.pickerScrollView}>
                      {years.slice(0, 50).map((year) => (
                        <TouchableOpacity
                          key={year}
                          style={[
                            styles.pickerOption,
                            selectedYear === year && styles.pickerOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedYear(year);
                            // Проверяем, что выбранный день существует в новом году
                            const daysInMonth = new Date(year, selectedMonth, 0).getDate();
                            if (selectedDay > daysInMonth) {
                              setSelectedDay(daysInMonth);
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.pickerOptionText,
                              selectedYear === year && styles.pickerOptionTextSelected,
                            ]}
                          >
                            {year}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowCustomPicker(false)}
                  >
                    <Text style={styles.cancelButtonText}>Отмена</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleConfirmCustomDate}
                  >
                    <Text style={styles.confirmButtonText}>Готово</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Пароль *</Text>
            <TextInput
              style={styles.input}
              placeholder="Введите пароль"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Подтвердите пароль *</Text>
            <TextInput
              style={styles.input}
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Зарегистрироваться</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Войти</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  dateInputPlaceholder: {
    color: '#999',
  },
  iosPickerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 8,
  },
  iosPickerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  iosPickerButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    maxHeight: 300,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  pickerScrollView: {
    maxHeight: 250,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  yearInputContainer: {
    marginBottom: 8,
  },
  yearInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});


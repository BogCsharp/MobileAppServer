import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiService } from '../services/api';

export const AdminClientsScreen: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const registerClient = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Email и пароль обязательны');
      return;
    }

    setLoading(true);
    try {
      await apiService.register({
        firstName,
        lastName,
        email,
        phone,
        password,
        confirmPassword: password,
      });
      Alert.alert('Успешно', 'Клиент зарегистрирован');
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setPassword('');
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.Message ||
        error?.message ||
        'Не удалось зарегистрировать клиента';
      Alert.alert('Ошибка', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация клиента</Text>
      <TextInput style={styles.input} placeholder="Имя" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Фамилия" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Телефон" value={phone} onChangeText={setPhone} />
      <TextInput style={styles.input} placeholder="Пароль" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={registerClient} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Сохранение...' : 'Зарегистрировать'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 16, gap: 10 },
  title: { fontSize: 22, fontWeight: '700', color: '#1C1C1E', marginBottom: 8 },
  input: { backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  button: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#FFF', fontWeight: '700' },
});

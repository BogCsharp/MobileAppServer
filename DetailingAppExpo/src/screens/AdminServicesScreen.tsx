import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiService } from '../services/api';
import { Service } from '../types';

const emptyForm = { name: '', description: '', price: '', duration: '', categoryId: '' };

export const AdminServicesScreen: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const load = async () => {
    const items = await apiService.getServices();
    setServices(items);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      duration: Number(form.duration),
      categoryId: Number(form.categoryId),
    };
    if (!payload.name || !payload.categoryId || !payload.price || !payload.duration) {
      Alert.alert('Ошибка', 'Заполните название, цену, длительность и categoryId');
      return;
    }

    try {
      if (editingId) {
        await apiService.updateService(editingId, payload);
      } else {
        await apiService.createService(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (error: any) {
      Alert.alert('Ошибка', error?.message || 'Не удалось сохранить услугу');
    }
  };

  const remove = async (id: number) => {
    Alert.alert('Удалить услугу', 'Подтвердите удаление', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiService.deleteService(id);
            await load();
          } catch {
            Alert.alert('Ошибка', 'Не удалось удалить услугу');
          }
        },
      },
    ]);
  };

  const startEdit = (service: Service) => {
    setEditingId(service.id);
    setForm({
      name: service.name,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
      categoryId: String(service.categoryId),
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Услуги</Text>
      <TextInput style={styles.input} placeholder="Название" value={form.name} onChangeText={(v) => setForm((s) => ({ ...s, name: v }))} />
      <TextInput style={styles.input} placeholder="Описание" value={form.description} onChangeText={(v) => setForm((s) => ({ ...s, description: v }))} />
      <TextInput style={styles.input} placeholder="Цена" value={form.price} onChangeText={(v) => setForm((s) => ({ ...s, price: v }))} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Длительность (мин)" value={form.duration} onChangeText={(v) => setForm((s) => ({ ...s, duration: v }))} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="CategoryId" value={form.categoryId} onChangeText={(v) => setForm((s) => ({ ...s, categoryId: v }))} keyboardType="numeric" />
      <TouchableOpacity style={styles.primaryButton} onPress={save}>
        <Text style={styles.primaryText}>{editingId ? 'Обновить услугу' : 'Добавить услугу'}</Text>
      </TouchableOpacity>

      <FlatList
        data={services}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>{item.price} ₽ | {item.duration} мин | cat #{item.categoryId}</Text>
            <View style={styles.row}>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => startEdit(item)}>
                <Text style={styles.secondaryText}>Изменить</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.dangerButton} onPress={() => remove(item.id)}>
                <Text style={styles.dangerText}>Удалить</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10, color: '#1C1C1E' },
  input: { backgroundColor: '#FFF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 8 },
  primaryButton: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginBottom: 12 },
  primaryText: { color: '#FFF', fontWeight: '700' },
  list: { gap: 8, paddingBottom: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 10, padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  row: { marginTop: 10, flexDirection: 'row', gap: 8 },
  secondaryButton: { borderWidth: 1, borderColor: '#007AFF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  secondaryText: { color: '#007AFF', fontWeight: '600' },
  dangerButton: { borderWidth: 1, borderColor: '#FF3B30', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  dangerText: { color: '#FF3B30', fontWeight: '600' },
});

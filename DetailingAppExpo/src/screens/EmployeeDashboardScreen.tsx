import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiService } from '../services/api';
import { EmployeeProfile } from '../types';
import { useAuth } from '../context/AuthContext';

export const EmployeeDashboardScreen: React.FC = () => {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const data = await apiService.getMyEmployeeProfile();
      setProfile(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const onToggleActive = async (value: boolean) => {
    if (!profile || toggling) return;
    setToggling(true);
    try {
      const updated = await apiService.updateMyEmployeeActive(value);
      setProfile(updated);
    } finally {
      setToggling(false);
    }
  };

  const onPressLogout = () => {
    Alert.alert('Выход', 'Выйти из аккаунта мастера?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          if (isLoggingOut) return;
          setIsLoggingOut(true);
          try {
            await logout();
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Профиль мастера не найден</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Кабинет мастера</Text>
      <Text style={styles.subtitle}>{profile.firstName} {profile.lastName}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Статус на работе</Text>
        <View style={styles.row}>
          <Text style={styles.valueText}>{profile.isActive ? 'На работе' : 'Не на работе'}</Text>
          <Switch
            value={profile.isActive}
            onValueChange={onToggleActive}
            disabled={toggling}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Данные мастера</Text>
        <Text style={styles.label}>Должность: <Text style={styles.valueText}>{profile.position || 'Мастер'}</Text></Text>
        <Text style={styles.label}>Телефон: <Text style={styles.valueText}>{profile.phone || '-'}</Text></Text>
        <Text style={styles.label}>Email: <Text style={styles.valueText}>{profile.email || '-'}</Text></Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, isLoggingOut && styles.logoutButtonDisabled]}
        onPress={onPressLogout}
        disabled={isLoggingOut}
      >
        <Text style={styles.logoutButtonText}>
          {isLoggingOut ? 'Выходим...' : 'Выйти из аккаунта'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
    gap: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  subtitle: {
    fontSize: 16,
    color: '#6C6C70',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#1C1C1E',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#3A3A3C',
  },
  valueText: {
    fontWeight: '600',
    color: '#1C1C1E',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});

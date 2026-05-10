import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { apiService } from '../services/api';
// @ts-ignore: vector icons are provided by Expo runtime
import { Ionicons } from '@expo/vector-icons';

// Auth screens
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';

// Main screens
import { HomeScreen } from '../screens/HomeScreen';
import { CartScreen } from '../screens/CartScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ServiceDetailsScreen } from '../screens/ServiceDetailsScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderDetailsScreen } from '../screens/OrderDetailsScreen';
import { DocumentationScreen } from '../screens/DocumentationScreen';
import { EmployeeDashboardScreen } from '../screens/EmployeeDashboardScreen';
import { EmployeeOrdersScreen } from '../screens/EmployeeOrdersScreen';
import { EmployeeEarningsScreen } from '../screens/EmployeeEarningsScreen';
import { AdminClientsScreen } from '../screens/AdminClientsScreen';
import { AdminServicesScreen } from '../screens/AdminServicesScreen';
import { AdminOrdersScreen } from '../screens/AdminOrdersScreen';
import { AdminPayrollScreen } from '../screens/AdminPayrollScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerTitle: 'Detail Pro',
        headerTitleAlign: 'center',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Home') {
            iconName = 'car-sport-outline';
          } else if (route.name === 'Cart') {
            iconName = 'cart-outline';
          } else if (route.name === 'Orders') {
            iconName = 'list-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Услуги',
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarLabel: 'Корзина',
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Заказы',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Профиль',
        }}
      />
    </Tab.Navigator>
  );
}

function EmployeeTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerTitle: 'Кабинет мастера',
        headerTitleAlign: 'center',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'briefcase-outline';
          if (route.name === 'EmployeeHome') {
            iconName = 'briefcase-outline';
          } else if (route.name === 'EmployeeOrders') {
            iconName = 'list-outline';
          } else if (route.name === 'EmployeeEarnings') {
            iconName = 'wallet-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="EmployeeHome"
        component={EmployeeDashboardScreen}
        options={{ tabBarLabel: 'Кабинет' }}
      />
      <Tab.Screen
        name="EmployeeOrders"
        component={EmployeeOrdersScreen}
        options={{ tabBarLabel: 'Мои заказы' }}
      />
      <Tab.Screen
        name="EmployeeEarnings"
        component={EmployeeEarningsScreen}
        options={{ tabBarLabel: 'Зарплата' }}
      />
    </Tab.Navigator>
  );
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerTitle: 'Панель администратора',
        headerTitleAlign: 'center',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'shield-checkmark-outline';
          if (route.name === 'AdminClients') {
            iconName = 'person-add-outline';
          } else if (route.name === 'AdminServices') {
            iconName = 'construct-outline';
          } else if (route.name === 'AdminOrders') {
            iconName = 'list-outline';
          } else if (route.name === 'AdminPayroll') {
            iconName = 'wallet-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminClients" component={AdminClientsScreen} options={{ tabBarLabel: 'Клиенты' }} />
      <Tab.Screen name="AdminServices" component={AdminServicesScreen} options={{ tabBarLabel: 'Услуги' }} />
      <Tab.Screen name="AdminOrders" component={AdminOrdersScreen} options={{ tabBarLabel: 'Заказы' }} />
      <Tab.Screen name="AdminPayroll" component={AdminPayrollScreen} options={{ tabBarLabel: 'Зарплата' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { user, isLoading } = useAuth();
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [roleCheckLoading, setRoleCheckLoading] = useState(false);
  const roleId = Number(user?.roleId);
  const roleName = (user?.roleName || '').toLowerCase();
  const isEmployee = roleId === 2 || roleName === 'employee';
  const isAdminByProfile = roleId === 3 || roleName === 'admin';
  const isAdmin = isAdminByProfile || hasAdminAccess;
  const roleTabsKey = isAdmin ? 'admin' : isEmployee ? 'employee' : 'client';

  useEffect(() => {
    let cancelled = false;

    const checkAdminAccess = async () => {
      if (!user) {
        if (!cancelled) {
          setHasAdminAccess(false);
          setRoleCheckLoading(false);
        }
        return;
      }

      if (isAdminByProfile) {
        if (!cancelled) {
          setHasAdminAccess(true);
          setRoleCheckLoading(false);
        }
        return;
      }

      setRoleCheckLoading(true);
      try {
        await apiService.getEmployees();
        if (!cancelled) {
          setHasAdminAccess(true);
        }
      } catch {
        if (!cancelled) {
          setHasAdminAccess(false);
        }
      } finally {
        if (!cancelled) {
          setRoleCheckLoading(false);
        }
      }
    };

    checkAdminAccess();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isAdminByProfile]);

  if (isLoading || roleCheckLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerTitle: 'Detail Pro',
          headerTitleAlign: 'center',
        }}
      >
        {/* Для таб-навигатора шапку даёт сам Tab.Navigator */}
        <Stack.Screen
          name="MainTabs"
          key={roleTabsKey}
          component={isAdmin ? AdminTabs : isEmployee ? EmployeeTabs : MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} />
        <Stack.Screen 
          name="Documentation" 
          component={DocumentationScreen}
          options={{ 
            headerTitle: 'Документация',
            headerTitleAlign: 'center',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


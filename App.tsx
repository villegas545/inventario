
import './global.css';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { InventoryProvider } from './context/InventoryContext';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import UserProductScreen from './screens/UserProductScreen';
import RestockScreen from './screens/RestockScreen';
import InventoryScreen from './screens/InventoryScreen';
import HistoryScreen from './screens/HistoryScreen';
import ProductHistoryScreen from './screens/ProductHistoryScreen';
import AddProductScreen from './screens/AddProductScreen';
import SummaryScreen from './screens/SummaryScreen';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  return (
    <InventoryProvider>
      <View className="flex-1 bg-[#333] items-center justify-center">
        <View
          className="flex-1 w-full h-full bg-white overflow-hidden shadow-xl"
          style={Platform.OS === 'web' ? { maxWidth: 480, maxHeight: 900 } : {}}
        >
          <NavigationContainer>
            <StatusBar style="dark" />
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="UserProduct" component={UserProductScreen} />
              <Stack.Screen name="Restock" component={RestockScreen} />
              <Stack.Screen name="Inventory" component={InventoryScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
              <Stack.Screen name="ProductHistory" component={ProductHistoryScreen} />
              <Stack.Screen name="AddProduct" component={AddProductScreen} />
              <Stack.Screen name="Summary" component={SummaryScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </View>
      </View>
    </InventoryProvider>
  );
}

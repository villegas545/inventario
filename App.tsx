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
import { View, Platform, StyleSheet } from 'react-native';

const Stack = createStackNavigator();

export default function App() {
  return (
    <InventoryProvider>
      <View style={styles.webContainer}>
        <View style={styles.mobileContainer}>
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

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#333', // Dark background outside phone
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileContainer: {
    flex: 1,
    width: Platform.OS === 'web' ? '100%' : '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%', // Max width for tablet/large phone feel
    height: Platform.OS === 'web' ? '100%' : '100%',
    maxHeight: Platform.OS === 'web' ? 900 : '100%',
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

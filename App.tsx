
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
import InactiveProductsScreen from './screens/InactiveProductsScreen';
import BackupScreen from './screens/BackupScreen';
import LastJobScreen from './screens/LastJobScreen';
import AnnouncementsAdminScreen from './screens/AnnouncementsAdminScreen';
import { StatusBar } from 'expo-status-bar';
import { View, Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import * as NavigationBar from 'expo-navigation-bar';

const Stack = createStackNavigator();

export default function App() {
  React.useEffect(() => {
    async function configureNavigationBar() {
      if (Platform.OS === 'android') {
        await NavigationBar.setVisibilityAsync("hidden");
        await NavigationBar.setBehaviorAsync("overlay-swipe");
      }
    }
    configureNavigationBar();
  }, []);

  return (
    <InventoryProvider>
      <View className="flex-1 bg-[#333] items-center justify-center">
        <View
          className="flex-1 w-full h-full bg-white overflow-hidden shadow-xl"
          style={Platform.OS === 'web' ? { maxWidth: 480, maxHeight: 900 } : {}}
        >
          <SafeAreaProvider>
            <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
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
                  <Stack.Screen name="InactiveProducts" component={InactiveProductsScreen} />
                  <Stack.Screen name="Backup" component={BackupScreen} />
                  <Stack.Screen name="LastJob" component={LastJobScreen} />
                  <Stack.Screen name="AnnouncementsAdmin" component={AnnouncementsAdminScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </SafeAreaView>
          </SafeAreaProvider>
        </View>
      </View>
    </InventoryProvider>
  );
}

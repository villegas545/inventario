import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useInventory } from '../context/InventoryContext';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen({ navigation }: { navigation: any }) {
    const { login } = useInventory();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Por favor ingresa usuario y contraseña');
            return;
        }

        setLoading(true);
        // Simulate a small delay for better UX feel
        setTimeout(() => {
            const user = login(username, password);
            setLoading(false);

            if (user) {
                navigation.replace('Dashboard');
            } else {
                Alert.alert('Error', 'Credenciales incorrectas');
            }
        }, 800);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-[#f8f9fa]"
        >
            <StatusBar style="dark" />
            <View className="flex-1 justify-center p-8 max-w-[500px] w-full self-center">
                <View className="items-center mb-10">
                    <Text className="text-6xl mb-2">🏠</Text>
                    <Text className="text-3xl font-bold text-[#2d3436] text-center">Bienvenido</Text>
                    <Text className="text-base text-[#636e72] mt-1 text-center">Sistema de Inventario Airbnb</Text>
                </View>

                <View className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-[#0984e3]">
                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-[#2d3436] mb-2 ml-1">Usuario</Text>
                        <TextInput
                            className="bg-[#f1f2f6] rounded-xl p-4 text-base text-[#2d3436]"
                            placeholder="Ej. admin"
                            placeholderTextColor="#999"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View className="mb-5">
                        <Text className="text-sm font-semibold text-[#2d3436] mb-2 ml-1">Contraseña</Text>
                        <TextInput
                            className="bg-[#f1f2f6] rounded-xl p-4 text-base text-[#2d3436]"
                            placeholder="••••••"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-[#0984e3] rounded-xl p-4 items-center mt-2 shadow-sm active:bg-[#006bb3]"
                        onPress={handleLogin}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Text className="text-white text-lg font-bold">
                            {loading ? 'Iniciando sesión...' : 'Ingresar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

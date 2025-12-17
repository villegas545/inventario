import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useInventory } from '../context/InventoryContext';
import { StatusBar } from 'expo-status-bar';

export default function LoginScreen({ navigation }) {
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
            style={styles.container}
        >
            <StatusBar style="dark" />
            <View style={styles.content}>
                <View style={styles.headerContainer}>
                    <Text style={styles.icon}>🏠</Text>
                    <Text style={styles.title}>Bienvenido</Text>
                    <Text style={styles.subtitle}>Sistema de Inventario Airbnb</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Usuario</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej. admin"
                            placeholderTextColor="#999"
                            value={username}
                            onChangeText={setUsername}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Contraseña</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••"
                            placeholderTextColor="#999"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        activeOpacity={0.8}
                        disabled={loading}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? 'Iniciando sesión...' : 'Ingresar'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        padding: 30,
        maxWidth: 500,
        width: '100%',
        alignSelf: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    icon: {
        fontSize: 60,
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#2d3436',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#636e72',
        marginTop: 5,
        textAlign: 'center',
    },
    formContainer: {
        backgroundColor: '#ffffff',
        padding: 30,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2d3436',
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: '#f1f2f6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#2d3436',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    loginButton: {
        backgroundColor: '#0984e3',
        borderRadius: 12,
        padding: 18,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#0984e3',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

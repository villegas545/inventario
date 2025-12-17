
import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function DashboardScreen({ navigation }) {
    const { products, currentUser, logout } = useInventory();

    const allMenuItems = [
        {
            icon: "📝",
            title: "Registrar Trabajo",
            subtitle: "Capturar consumo diario",
            target: "UserProduct",
            color: "#4ECDC4",
            roles: ['admin', 'user']
        },
        {
            icon: "📦",
            title: "Reponer Inventario",
            subtitle: "Agregar stock existente",
            target: "Restock",
            color: "#FF6B6B",
            roles: ['admin', 'user']
        },
        {
            icon: "👀",
            title: "Ver Inventario",
            subtitle: "Revisar lista completa",
            target: "Inventory",
            color: "#FF9F43",
            roles: ['admin', 'user']
        },
        {
            icon: "📅",
            title: "Ver Historial",
            subtitle: "Auditoría de movimientos",
            target: "History",
            color: "#54a0ff",
            roles: ['admin', 'user']
        },
        {
            icon: "➕",
            title: "Nuevo Producto",
            subtitle: "Crear item en catálogo",
            target: "AddProduct",
            color: "#ff9ff3",
            roles: ['admin'] // ADMIN only
        }
    ];

    const menuItems = allMenuItems.filter(item =>
        item.roles.includes(currentUser?.role || 'user')
    );

    const handleLogout = () => {
        logout();
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hola, {currentUser?.name || 'Usuario'}</Text>
                    <Text style={styles.subGreeting}>
                        {currentUser?.role === 'admin' ? 'Panel de Control Maestro' : 'Panel de Encargada'}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.shortcuts}
                onPress={() => navigation.navigate("Inventory")}
            >
                <Text style={styles.summaryTitle}>Resumen Rápido</Text>
                <Text style={styles.summaryText}>{products.length} productos registrados</Text>
            </TouchableOpacity>

            <FlatList
                data={menuItems}
                keyExtractor={(item) => item.title}
                contentContainerStyle={styles.menuList}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.menuItem, { borderLeftColor: item.color }]}
                        onPress={() => navigation.navigate(item.target)}
                    >
                        <View style={[styles.iconBox, { backgroundColor: item.color }]}>
                            <Text style={styles.iconText}>{item.icon}</Text>
                        </View>
                        <View style={styles.menuInfo}>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Text style={styles.arrow}>→</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 30,
        paddingTop: 60,
        backgroundColor: '#333',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
    },
    greeting: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
    },
    subGreeting: {
        fontSize: 16,
        color: '#ddd',
        marginTop: 5,
    },
    logoutButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    shortcuts: {
        margin: 20,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        elevation: 2,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    summaryText: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    menuList: {
        padding: 20,
    },
    menuItem: {
        backgroundColor: '#fff',
        marginBottom: 15,
        borderRadius: 15,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        borderLeftWidth: 5,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    iconText: {
        fontSize: 24,
    },
    menuInfo: {
        flex: 1,
    },
    menuTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    menuSubtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    arrow: {
        fontSize: 24,
        color: '#ccc',
        fontWeight: 'bold',
    },
});


import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function DashboardScreen({ navigation }: { navigation: any }) {
    const { products, currentUser, logout } = useInventory();



    const allMenuItems = [
        {
            icon: "📝",
            title: "Registrar Trabajo",
            subtitle: "Capturar consumo diario",
            target: "UserProduct",
            color: "#4ECDC4", // Teal
            roles: ['admin', 'user']
        },
        {
            icon: "⏮️",
            title: "Último Trabajo",
            subtitle: "Ver y deshacer (Rollback)",
            target: "LastJob",
            color: "#e17055", // Burnt Sienna
            roles: ['admin'] // ADMIN only
        },
        {
            icon: "📦",
            title: "Reponer Inventario",
            subtitle: "Agregar stock existente",
            target: "Restock",
            color: "#FF6B6B", // Red
            roles: ['admin', 'user']
        },
        {
            icon: "👀",
            title: "Ver Inventario",
            subtitle: "Revisar lista completa",
            target: "Inventory",
            color: "#FF9F43", // Orange
            roles: ['admin', 'user']
        },
        {
            icon: "📅",
            title: "Ver Historial",
            subtitle: "Auditoría de movimientos",
            target: "History",
            color: "#54a0ff", // Blue
            roles: ['admin', 'user']
        },
        {
            icon: "➕",
            title: "Nuevo Producto",
            subtitle: "Crear item en catálogo",
            target: "AddProduct",
            color: "#ff9ff3", // Pink
            roles: ['admin'] // ADMIN only
        },
        {
            icon: "🗑️",
            title: "Papelera",
            subtitle: "Restaurar o eliminar",
            target: "InactiveProducts",
            color: "#636e72", // Gray
            roles: ['admin'] // ADMIN only
        },
        {
            icon: "💾",
            title: "Respaldos",
            subtitle: "Descargar o restaurar DB",
            target: "Backup",
            color: "#6c5ce7", // Purple
            roles: ['admin']
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
        <View className="flex-1 bg-[#f5f5f5]">
            <View className="flex-row justify-between items-center p-8 pt-16 bg-[#333] rounded-b-[30px] shadow-lg">
                <View>
                    <Text className="text-3xl font-bold text-white">Hola, {currentUser?.name || 'Usuario'}</Text>
                    <Text className="text-base text-[#ddd] mt-1">
                        {currentUser?.role === 'admin' ? 'Panel de Control Maestro' : 'Panel de Encargada'}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout} className="bg-white/20 py-2 px-4 rounded-full">
                    <Text className="text-white font-bold">Salir</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                className="m-5 bg-white p-5 rounded-2xl shadow-sm active:bg-gray-50"
                onPress={() => navigation.navigate("Inventory")}
            >
                <Text className="text-lg font-bold text-[#333]">Resumen Rápido</Text>
                <Text className="text-sm text-[#666] mt-1">{products.length} productos registrados</Text>
            </TouchableOpacity>

            <FlatList
                data={menuItems}
                keyExtractor={(item) => item.title}
                contentContainerStyle={{ padding: 20 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-white mb-4 rounded-xl p-5 flex-row items-center border-l-[5px] shadow-sm active:bg-gray-50"
                        style={{ borderLeftColor: item.color }}
                        onPress={() => navigation.navigate(item.target)}
                    >
                        <View className="w-12 h-12 rounded-full justify-center items-center mr-4" style={{ backgroundColor: item.color }}>
                            <Text className="text-2xl">{item.icon}</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="text-lg font-bold text-[#333]">{item.title}</Text>
                            <Text className="text-sm text-[#888] mt-0.5">{item.subtitle}</Text>
                        </View>
                        <Text className="text-2xl text-[#ccc] font-bold">→</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}


import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
import { useInventory, Announcement } from '../context/InventoryContext';

export default function DashboardScreen({ navigation }: { navigation: any }) {
    const { products, currentUser, logout, announcements } = useInventory();

    // Announcement Logic for Encargado
    const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
    const [queue, setQueue] = useState<Announcement[]>([]);

    useEffect(() => {
        if (currentUser?.role === 'user' && announcements.length > 0) {
            // Filter active announcements
            const active = announcements.filter((a: Announcement) => a.isActive);
            if (active.length > 0) {
                setQueue(active);
                setCurrentAnnouncement(active[0]);
            }
        }
    }, [currentUser, announcements]);

    const handleConfirmAnnouncement = () => {
        // Remove current from queue
        const nextQueue = queue.slice(1);
        setQueue(nextQueue);

        if (nextQueue.length > 0) {
            setCurrentAnnouncement(nextQueue[0]);
        } else {
            setCurrentAnnouncement(null);
        }
    };

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
            icon: "📢", // Icon for Announcements
            title: "Gestión de Avisos",
            subtitle: "Crear mensajes para encargados",
            target: "AnnouncementsAdmin",
            color: "#f1c40f", // Yellow/Gold
            roles: ['admin']
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

            {/* Announcement Modal for Encargado */}
            <Modal
                transparent={true}
                visible={!!currentAnnouncement && currentUser?.role === 'user'}
                animationType="fade"
                onRequestClose={() => { }} // Block back button closing
            >
                <View className="flex-1 bg-black/80 justify-center items-center p-6">
                    <View className="bg-white w-full max-w-[350px] p-6 rounded-3xl items-center shadow-2xl">
                        <Text className="text-5xl mb-4">📢</Text>
                        <Text className="text-2xl font-bold text-[#333] mb-4 text-center">
                            AVISO IMPORTANTE
                        </Text>

                        <View className="bg-[#fff9c4] p-4 rounded-xl w-full mb-6 border-l-4 border-[#f1c40f]">
                            <Text className="text-lg text-[#333] text-center font-medium leading-6">
                                {currentAnnouncement?.message}
                            </Text>
                        </View>

                        <Text className="text-sm text-[#999] mb-6">
                            {queue.length > 1 ? `Mensaje 1 de ${queue.length}` : 'Mensaje Final'}
                        </Text>

                        <TouchableOpacity
                            className="bg-[#4ECDC4] w-full py-4 rounded-xl items-center shadow-md active:opacity-90"
                            onPress={handleConfirmAnnouncement}
                        >
                            <Text className="text-white font-bold text-lg">ENTERADO / CONFIRMAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

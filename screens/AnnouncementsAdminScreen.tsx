import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Switch } from 'react-native';
import { useInventory, Announcement } from '../context/InventoryContext';

export default function AnnouncementsAdminScreen({ navigation }: { navigation: any }) {
    const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useInventory();
    const [newMessage, setNewMessage] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const handleAdd = async () => {
        if (!newMessage.trim()) return;
        try {
            if (editingId) {
                await updateAnnouncement(editingId, { message: newMessage });
                setEditingId(null);
                Alert.alert("Actualizado", "El anuncio ha sido modificado.");
            } else {
                await addAnnouncement(newMessage);
                Alert.alert("Creado", "El anuncio ha sido agregado.");
            }
            setNewMessage('');
        } catch (e) {
            Alert.alert("Error", "No se pudo guardar el anuncio.");
        }
    };

    const handleEdit = (item: Announcement) => {
        setNewMessage(item.message);
        setEditingId(item.id);
    };

    const handleCancelEdit = () => {
        setNewMessage('');
        setEditingId(null);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Eliminar Anuncio",
            "¿Estás seguro? Esta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteAnnouncement(id);
                        } catch (e) {
                            Alert.alert("Error", "No se pudo eliminar.");
                        }
                    }
                }
            ]
        );
    };

    const handleToggleActive = async (item: Announcement) => {
        try {
            await updateAnnouncement(item.id, { isActive: !item.isActive });
        } catch (e) {
            console.error(e);
        }
    };

    const renderItem = ({ item }: { item: Announcement }) => (
        <View className={`bg-white p-4 mb-3 rounded-xl shadow-sm border-l-4 ${item.isActive ? 'border-[#4ECDC4]' : 'border-[#ccc]'}`}>
            <View className="flex-row justify-between items-start">
                <View className="flex-1 mr-2">
                    <Text className={`text-base font-semibold ${item.isActive ? 'text-[#333]' : 'text-[#999]'}`}>
                        {item.message}
                    </Text>
                    <Text className="text-xs text-[#bbb] mt-1">
                        {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                </View>
                <Switch
                    value={item.isActive}
                    onValueChange={() => handleToggleActive(item)}
                    trackColor={{ false: "#767577", true: "#4ECDC4" }}
                    thumbColor={item.isActive ? "#fff" : "#f4f3f4"}
                />
            </View>
            <View className="flex-row mt-3 justify-end gap-3">
                <TouchableOpacity
                    className="bg-[#f0f0f0] py-2 px-4 rounded-lg"
                    onPress={() => handleEdit(item)}
                >
                    <Text className="text-[#666] font-bold text-sm">Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="bg-[#ffecec] py-2 px-4 rounded-lg"
                    onPress={() => handleDelete(item.id)}
                >
                    <Text className="text-[#FF6B6B] font-bold text-sm">Eliminar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-[#f5f5f5]">
            <View className="flex-row items-center p-5 bg-white border-b border-[#ddd]">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2">
                    <Text className="text-lg text-[#666]">← Volver</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-[#333]">Gestión de Avisos</Text>
            </View>

            <View className="p-5">
                <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                    <Text className="text-sm font-bold text-[#666] mb-2">
                        {editingId ? "Editar Aviso" : "Nuevo Aviso"}
                    </Text>
                    <TextInput
                        className="bg-[#f9f9f9] border border-[#ddd] p-3 rounded-lg text-base min-h-[80px]"
                        placeholder="Escribe el mensaje aquí..."
                        multiline
                        value={newMessage}
                        onChangeText={setNewMessage}
                        textAlignVertical="top"
                    />
                    <View className="flex-row gap-3 mt-3">
                        {editingId && (
                            <TouchableOpacity
                                className="flex-1 bg-[#ccc] p-3 rounded-lg items-center"
                                onPress={handleCancelEdit}
                            >
                                <Text className="font-bold text-white">Cancelar</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            className={`flex-1 p-3 rounded-lg items-center ${newMessage.trim() ? 'bg-[#4ECDC4]' : 'bg-[#aaccce]'}`}
                            onPress={handleAdd}
                            disabled={!newMessage.trim()}
                        >
                            <Text className="font-bold text-white">
                                {editingId ? "Actualizar" : "Publicar Aviso"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text className="text-lg font-bold text-[#555] mb-3">Historial de Avisos</Text>

                <FlatList
                    data={announcements}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    ListEmptyComponent={
                        <Text className="text-center text-[#999] mt-5">No hay avisos registrados.</Text>
                    }
                />
            </View>
        </View>
    );
}

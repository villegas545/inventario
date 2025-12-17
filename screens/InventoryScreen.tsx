
import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, Modal, ScrollView, Alert, KeyboardAvoidingView, Platform, ListRenderItem } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function InventoryScreen({ navigation }: { navigation: any }) {
    const { products, currentUser, updateProductDetails, deleteProduct } = useInventory();
    const [searchText, setSearchText] = useState('');

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
        unit: '',
        // image: '' - Removed
    });

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) && p.isActive !== false
    );

    const handleEditStart = (product: any) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            description: product.description || '',
            unit: product.unit,
            // image: product.image - Removed
        });
        setEditModalVisible(true);
    };

    const handleSaveEdit = async () => {
        if (!editingProduct) return;

        if (!editForm.name || !editForm.unit) {
            Alert.alert("Error", "El nombre y la unidad son obligatorios");
            return;
        }

        try {
            await updateProductDetails(editingProduct.id, editForm);
            setEditModalVisible(false);
            setEditingProduct(null);
            Alert.alert("✅ Éxito", "Producto actualizado correctamente");
        } catch (error) {
            Alert.alert("❌ Error", "No se pudo actualizar el producto.");
            console.error(error);
        }
    };

    const handleDelete = () => {
        if (!editingProduct) return;

        Alert.alert(
            "Eliminar Producto",
            "¿Estás seguro de que quieres eliminar este producto? Se ocultará del inventario pero el historial permanecerá.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteProduct(editingProduct.id);
                            setEditModalVisible(false);
                            setEditingProduct(null);
                            Alert.alert("🗑️ Eliminado", "El producto ha sido eliminado del inventario activo.");
                        } catch (error) {
                            Alert.alert("❌ Error", "No se pudo eliminar el producto.");
                            console.error(error);
                        }
                    }
                }
            ]
        );
    };

    const renderItem: ListRenderItem<any> = ({ item }) => (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-4 flex-row items-center shadow-sm"
            onPress={() => navigation.navigate('ProductHistory', { productId: item.id })}
            activeOpacity={0.7}
        >

            <View className="flex-1 pr-2.5">
                <Text className="text-lg font-bold text-[#333] mb-1">{item.name}</Text>
                <Text className="text-sm text-[#888] mb-1" numberOfLines={1}>{item.description}</Text>
                <Text className="text-xs text-[#4ECDC4] italic">(Toca para ver historial)</Text>
            </View>

            <View className="items-center justify-center gap-2.5">
                <View className="items-center min-w-[60px]">
                    <Text className="text-xs text-[#999] mb-0.5">Hay</Text>
                    <Text className={`text-2xl font-bold ${item.quantity === 0 ? 'text-[#FF6B6B]' : (item.quantity < 5 ? 'text-[#FF9F43]' : 'text-[#4ECDC4]')}`}>
                        {item.quantity}
                    </Text>
                    <Text className="text-xs text-[#999]">{item.unit}</Text>
                </View>

                {currentUser?.role === 'admin' && (
                    <TouchableOpacity
                        className="bg-[#f0f0f0] p-2 rounded-[20px] w-[35px] h-[35px] items-center justify-center"
                        onPress={(e) => {
                            e.stopPropagation();
                            handleEditStart(item);
                        }}
                    >
                        <Text className="text-lg text-[#666]">✎</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f5f5f5]">
            <View className="flex-row items-center p-5 bg-white border-b border-[#ddd]">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2.5 mr-2.5">
                    <Text className="text-lg text-[#666]">← Volver</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-[#333]">Inventario Actual</Text>
            </View>

            <View className="p-5 pb-0">
                <TextInput
                    className="bg-white p-4 rounded-xl text-lg border border-[#ddd] shadow-sm"
                    placeholder="🔍 Buscar producto..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#999"
                />
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
            />

            <Modal
                transparent={true}
                visible={editModalVisible}
                animationType="slide"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 bg-black/50 justify-center items-center"
                >
                    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', width: '100%' }}>
                        <View className="bg-white rounded-2xl p-6 w-[90%] max-w-[400px] self-center shadow-lg">
                            <Text className="text-2xl font-bold text-[#333] mb-1 text-center">Editar Producto</Text>
                            <Text className="text-sm text-[#FF6B6B] mb-5 text-center italic">Nota: La cantidad solo se edita en "Reponer Inventario"</Text>

                            <Text className="text-base text-[#666] mb-1.5 font-semibold">Nombre</Text>
                            <TextInput
                                className="bg-[#f9f9f9] border border-[#ddd] rounded-xl p-3 text-base mb-4"
                                value={editForm.name}
                                onChangeText={(t) => setEditForm({ ...editForm, name: t })}
                            />

                            <Text className="text-base text-[#666] mb-1.5 font-semibold">Descripción</Text>
                            <TextInput
                                className="bg-[#f9f9f9] border border-[#ddd] rounded-xl p-3 text-base mb-4"
                                value={editForm.description}
                                onChangeText={(t) => setEditForm({ ...editForm, description: t })}
                            />

                            <Text className="text-base text-[#666] mb-1.5 font-semibold">Unidad de medida (kg, pza, etc)</Text>
                            <TextInput
                                className="bg-[#f9f9f9] border border-[#ddd] rounded-xl p-3 text-base mb-4"
                                value={editForm.unit}
                                onChangeText={(t) => setEditForm({ ...editForm, unit: t })}
                            />



                            <View className="flex-row gap-4 mt-2">
                                <TouchableOpacity
                                    className="flex-1 p-4 rounded-xl items-center bg-[#FF6B6B]"
                                    onPress={() => setEditModalVisible(false)}
                                >
                                    <Text className="text-white font-bold text-base">Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    className="flex-1 p-4 rounded-xl items-center bg-[#4ECDC4]"
                                    onPress={handleSaveEdit}
                                >
                                    <Text className="text-white font-bold text-base">Guardar</Text>
                                </TouchableOpacity>
                            </View>

                            {currentUser?.role === 'admin' && (
                                <TouchableOpacity
                                    className="mt-5 p-4 bg-[#fff0f0] rounded-xl border border-[#ffcccc] items-center"
                                    onPress={handleDelete}
                                >
                                    <Text className="text-[#FF6B6B] font-bold text-sm">🗑️ Eliminar Producto</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

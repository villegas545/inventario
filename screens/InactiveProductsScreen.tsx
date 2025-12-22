
import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function InactiveProductsScreen({ navigation }: { navigation: any }) {
    const { products, restoreProduct, permanentDeleteProduct } = useInventory();

    const inactiveProducts = products
        .filter((p: any) => p.isActive === false)
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

    const handleRestore = (product: any) => {
        Alert.alert(
            "Restaurar Producto",
            `¿Quieres restaurar "${product.name}"? Volverá a aparecer en el inventario.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Restaurar",
                    onPress: async () => {
                        try {
                            await restoreProduct(product.id);
                            Alert.alert("Éxito", "Producto restaurado correctamente.");
                        } catch (e) {
                            Alert.alert("Error", "No se pudo restaurar el producto.");
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = (product: any) => {
        Alert.alert(
            "Eliminar Definitivamente",
            `ADVERTENCIA: ¿Estás seguro de borrar "${product.name}" para siempre? Esta acción NO se puede deshacer y perderás todo su historial.`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "ELIMINAR",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await permanentDeleteProduct(product.id);
                            Alert.alert("Eliminado", "El producto ha sido borrado permanentemente.");
                        } catch (e) {
                            Alert.alert("Error", "No se pudo eliminar el producto.");
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white rounded-xl p-4 mb-4 flex-row items-center shadow-sm border border-gray-200">
            <View className="flex-1">
                <Text className="text-lg font-bold text-gray-400 line-through">{item.name}</Text>
                <Text className="text-sm text-gray-400 italic">Desactivado</Text>
            </View>
            <View className="flex-row gap-2">
                <TouchableOpacity
                    className="p-3 bg-[#4ECDC4] rounded-lg"
                    onPress={() => handleRestore(item)}
                >
                    <Text className="text-white font-bold text-xs">♻️ Restaurar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="p-3 bg-[#FF6B6B] rounded-lg"
                    onPress={() => handleDelete(item)}
                >
                    <Text className="text-white font-bold text-xs">🗑️ Borrar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-[#f5f5f5]">
            <View className="flex-row items-center p-5 bg-white border-b border-[#ddd]">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2.5 mr-2.5">
                    <Text className="text-lg text-[#666]">← Volver</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-[#333]">Papelera</Text>
            </View>

            {inactiveProducts.length === 0 ? (
                <View className="flex-1 justify-center items-center p-10">
                    <Text className="text-xl text-gray-400 text-center">No hay productos en la papelera.</Text>
                </View>
            ) : (
                <FlatList
                    data={inactiveProducts}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20 }}
                />
            )}
        </View>
    );
}

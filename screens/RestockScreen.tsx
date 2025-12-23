
import React, { useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function RestockScreen({ navigation }: { navigation: any }) {
    const { products, updateProductQuantity, editProductQuantity, currentUser } = useInventory();
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [amountInput, setAmountInput] = useState('');
    const [searchText, setSearchText] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    const handleSelect = (product: any) => {
        setSelectedProduct(product);
        setAmountInput('');
        setIsEditMode(false);
    };

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchText.toLowerCase()) && p.isActive !== false
    );

    const handleConfirmRestock = () => {
        // Use parseFloat instead of parseInt to allow decimals
        const amount = parseFloat(amountInput);
        if (isNaN(amount) || amount < 0) {
            Alert.alert("Error", "Ingresa una cantidad válida");
            return;
        }

        if (isEditMode) {
            editProductQuantity(selectedProduct.id, amount);
            Alert.alert("¡Actualizado!", `El inventario de ${selectedProduct.name} se ajustó a ${amount} ${selectedProduct.unit}`);
        } else {
            if (amount <= 0) {
                Alert.alert("Error", "La cantidad a agregar debe ser mayor a 0");
                return;
            }
            updateProductQuantity(selectedProduct.id, amount);
            Alert.alert("¡Listo!", `Agregaste ${amount} ${selectedProduct.unit} de ${selectedProduct.name}`);
        }

        setSelectedProduct(null);
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white rounded-xl p-4 mb-4 flex-row items-center shadow-sm"
            onPress={() => handleSelect(item)}
        >

            <View className="flex-1 mr-2">
                <Text className="text-lg font-bold text-[#333]" numberOfLines={1}>{item.name}</Text>
                {item.description ? (
                    <Text className="text-xs text-[#666] italic mb-1" numberOfLines={2}>{item.description}</Text>
                ) : null}
                <Text className="text-sm text-[#888]">Hay: {item.quantity} {item.unit}</Text>
            </View>
            <View className="bg-[#eafbf9] py-2 px-4 rounded-full">
                <Text className="text-[#4ECDC4] font-bold">+ Agregar</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-[#f5f5f5]">
            <View className="flex-row items-center p-5 bg-white border-b border-[#ddd]">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2.5 mr-2.5">
                    <Text className="text-lg text-[#666]">← Volver</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-[#333]">Reponer Inventario</Text>
            </View>

            <View className="p-5 pb-0">
                <TextInput
                    className="bg-white p-4 rounded-xl text-lg border border-[#ddd] shadow-sm"
                    placeholder="🔍 Buscar para reponer..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#999"
                />
            </View>

            <Text className="text-lg text-[#666] p-5 pb-0">Selecciona un producto para agregar:</Text>

            <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 20 }}
            />

            <Modal
                transparent={true}
                visible={!!selectedProduct}
                animationType="slide"
                onRequestClose={() => setSelectedProduct(null)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1 bg-black/50 justify-center items-center"
                >
                    <View className="bg-white w-[85%] max-w-[400px] rounded-2xl p-8 items-center shadow-lg">
                        {selectedProduct && (
                            <>
                                <Text className="text-2xl font-bold text-[#333] mb-2.5 text-center">
                                    {isEditMode ? 'Editar Cantidad' : `Agregar ${selectedProduct.name}`}
                                </Text>
                                <Text className="text-base text-[#666] mb-5 text-center">
                                    Actualmente hay {selectedProduct.quantity} {selectedProduct.unit}
                                </Text>

                                {currentUser?.role === 'admin' && (
                                    <View className="flex-row bg-[#e0e0e0] rounded-lg mb-5 p-1 w-full text-center">
                                        <TouchableOpacity
                                            className={`flex-1 py-2.5 items-center rounded-lg ${!isEditMode ? 'bg-white shadow-sm' : ''}`}
                                            onPress={() => setIsEditMode(false)}
                                        >
                                            <Text className={`font-semibold ${!isEditMode ? 'text-[#333] font-bold' : 'text-[#888]'}`}>Sumar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className={`flex-1 py-2.5 items-center rounded-lg ${isEditMode ? 'bg-white shadow-sm' : ''}`}
                                            onPress={() => setIsEditMode(true)}
                                        >
                                            <Text className={`font-semibold ${isEditMode ? 'text-[#333] font-bold' : 'text-[#888]'}`}>Editar Total</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <TextInput
                                    className="w-full bg-[#f9f9f9] border border-[#ddd] rounded-xl p-4 text-xl text-center mb-6"
                                    value={amountInput}
                                    // Allow numbers and one decimal point
                                    onChangeText={(text) => {
                                        // Validar que sea número o punto decimal válido
                                        if (/^\d*\.?\d*$/.test(text)) {
                                            setAmountInput(text);
                                        }
                                    }}
                                    placeholder={isEditMode ? "Nueva cantidad total" : "Cantidad a agregar"}
                                    keyboardType="decimal-pad"
                                    autoFocus={true}
                                />

                                <View className="flex-row gap-4 w-full justify-center">
                                    <TouchableOpacity
                                        className="flex-1 p-4 rounded-xl items-center bg-[#FF6B6B]"
                                        onPress={() => setSelectedProduct(null)}
                                    >
                                        <Text className="text-white font-bold text-base">Cancelar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-1 p-4 rounded-xl items-center bg-[#4ECDC4]"
                                        onPress={handleConfirmRestock}
                                    >
                                        <Text className="text-white font-bold text-base">
                                            {isEditMode ? 'Guardar' : 'Confirmar'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

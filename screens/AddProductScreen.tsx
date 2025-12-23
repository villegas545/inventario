
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function AddProductScreen({ navigation }: { navigation: any }) {
    const { addNewProduct } = useInventory();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('');
    const [initialQty, setInitialQty] = useState('');

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name || !unit || !initialQty) {
            Alert.alert("Error", "Por favor completa los campos obligatorios (Nombre, Unidad, Cantidad).");
            return;
        }

        const qty = parseFloat(initialQty);
        if (isNaN(qty) || qty < 0) {
            Alert.alert("Error", "La cantidad inicial debe ser un número válido.");
            return;
        }

        setIsSaving(true);

        try {
            const newProduct = {
                name,
                description,
                unit,
                quantity: qty
            };

            await addNewProduct(newProduct);

            Alert.alert("✅ Producto Agregado", "El producto se ha guardado correctamente. Puedes agregar otro.", [
                { text: "OK" }
            ]);

            // Clear fields to allow continuous adding
            setName('');
            setDescription('');
            setUnit('');
            setInitialQty('');


        } catch (error) {
            Alert.alert("❌ Error", "No se pudo guardar el producto. Verifica tu conexión e inténtalo de nuevo.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ScrollView className="flex-1 bg-[#f5f5f5]">
            <View className="flex-row items-center p-5 bg-white border-b border-[#ddd]">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2">
                    <Text className="text-lg text-[#666]">← Volver</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-[#333]">Nuevo Producto</Text>
            </View>

            <View className="p-5">
                <Text className="text-base font-bold text-[#333] mb-1.5 mt-4">Nombre del Producto *</Text>
                <TextInput
                    className="bg-white border border-[#ddd] rounded-xl p-4 text-base"
                    value={name}
                    onChangeText={setName}
                    placeholder="Ej. Jabón Líquido"
                />

                <Text className="text-base font-bold text-[#333] mb-1.5 mt-4">Descripción</Text>
                <TextInput
                    className="bg-white border border-[#ddd] rounded-xl p-4 text-base"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ej. Botella de 1 litro"
                />

                <Text className="text-base font-bold text-[#333] mb-1.5 mt-4">Unidad de Medida *</Text>
                <TextInput
                    className="bg-white border border-[#ddd] rounded-xl p-4 text-base"
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="Ej. botellas, cajas, rollos"
                />

                <Text className="text-base font-bold text-[#333] mb-1.5 mt-4">Cantidad Inicial *</Text>
                <TextInput
                    className="bg-white border border-[#ddd] rounded-xl p-4 text-base"
                    value={initialQty}
                    onChangeText={(text) => {
                        if (/^\d*\.?\d*$/.test(text)) {
                            setInitialQty(text);
                        }
                    }}
                    placeholder="0"
                    keyboardType="decimal-pad"
                />



                <TouchableOpacity
                    className={`p-5 rounded-2xl items-center mt-8 shadow-md ${isSaving ? 'bg-[#aaccce] opacity-70' : 'bg-[#4ECDC4]'}`}
                    onPress={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white text-lg font-bold">Guardar Producto</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

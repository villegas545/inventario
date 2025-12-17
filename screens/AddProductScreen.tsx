
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function AddProductScreen({ navigation }) {
    const { addNewProduct } = useInventory();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [unit, setUnit] = useState('');
    const [image, setImage] = useState('https://via.placeholder.com/150'); // Default image
    const [initialQty, setInitialQty] = useState('');

    const handleSave = () => {
        if (!name || !unit || !initialQty) {
            Alert.alert("Error", "Por favor completa los campos obligatorios (Nombre, Unidad, Cantidad).");
            return;
        }

        const qty = parseInt(initialQty);
        if (isNaN(qty) || qty < 0) {
            Alert.alert("Error", "La cantidad inicial debe ser un número válido.");
            return;
        }

        const newProduct = {
            name,
            description,
            unit,
            image,
            quantity: qty
        };

        addNewProduct(newProduct);

        Alert.alert("¡Éxito!", "Producto agregado correctamente.", [
            { text: "OK", onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Nuevo Producto</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Nombre del Producto *</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ej. Jabón Líquido"
                />

                <Text style={styles.label}>Descripción</Text>
                <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ej. Botella de 1 litro"
                />

                <Text style={styles.label}>Unidad de Medida *</Text>
                <TextInput
                    style={styles.input}
                    value={unit}
                    onChangeText={setUnit}
                    placeholder="Ej. botellas, cajas, rollos"
                />

                <Text style={styles.label}>Cantidad Inicial *</Text>
                <TextInput
                    style={styles.input}
                    value={initialQty}
                    onChangeText={(text) => setInitialQty(text.replace(/[^0-9]/g, ''))}
                    placeholder="0"
                    keyboardType="numeric"
                />

                <Text style={styles.label}>URL de Imagen (Opcional)</Text>
                <TextInput
                    style={styles.input}
                    value={image}
                    onChangeText={setImage}
                    placeholder="https://..."
                />

                <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                    <Text style={styles.saveBtnText}>Guardar Producto</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    backButton: {
        padding: 10,
        marginRight: 10,
    },
    backText: {
        fontSize: 18,
        color: '#666',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    form: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
    },
    saveBtn: {
        backgroundColor: '#4ECDC4',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 30,
        elevation: 3,
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

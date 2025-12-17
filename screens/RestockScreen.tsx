
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, Alert, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function RestockScreen({ navigation }) {
    const { products, updateProductQuantity, editProductQuantity, currentUser } = useInventory();
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [addAmount, setAddAmount] = useState(''); // Kept for legacy compatibility if needed
    const [amountInput, setAmountInput] = useState(''); // New unified input
    const [searchText, setSearchText] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    const handleSelect = (product) => {
        setSelectedProduct(product);
        setAmountInput('');
        setIsEditMode(false);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleConfirmRestock = () => {
        const amount = parseInt(amountInput);
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

    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleSelect(item)}>
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.currentStock}>Hay: {item.quantity} {item.unit}</Text>
            </View>
            <View style={styles.addButton}>
                <Text style={styles.addButtonText}>+ Agregar</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Reponer Inventario</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Buscar para reponer..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#999"
                />
            </View>

            <Text style={styles.subtitle}>Selecciona un producto para agregar:</Text>

            <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />

            {/* Modal for Input */}
            <Modal
                transparent={true}
                visible={!!selectedProduct}
                animationType="slide"
                onRequestClose={() => setSelectedProduct(null)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContent}>
                        {selectedProduct && (
                            <>
                                <Text style={styles.modalTitle}>
                                    {isEditMode ? 'Editar Cantidad' : `Agregar ${selectedProduct.name}`}
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    Actualmente hay {selectedProduct.quantity} {selectedProduct.unit}
                                </Text>

                                {currentUser?.role === 'admin' && (
                                    <View style={styles.modeSwitch}>
                                        <TouchableOpacity
                                            style={[styles.modeOption, !isEditMode && styles.activeMode]}
                                            onPress={() => setIsEditMode(false)}
                                        >
                                            <Text style={[styles.modeText, !isEditMode && styles.activeModeText]}>Sumar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.modeOption, isEditMode && styles.activeMode]}
                                            onPress={() => setIsEditMode(true)}
                                        >
                                            <Text style={[styles.modeText, isEditMode && styles.activeModeText]}>Editar Total</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <TextInput
                                    style={styles.input}
                                    value={amountInput}
                                    onChangeText={(text) => setAmountInput(text.replace(/[^0-9]/g, ''))}
                                    placeholder={isEditMode ? "Nueva cantidad total" : "Cantidad a agregar"}
                                    keyboardType="numeric"
                                    autoFocus={true}
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalBtn, styles.cancelBtn]}
                                        onPress={() => setSelectedProduct(null)}
                                    >
                                        <Text style={styles.modalBtnText}>Cancelar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.modalBtn, styles.confirmBtn]}
                                        onPress={handleConfirmRestock}
                                    >
                                        <Text style={styles.modalBtnText}>
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
    subtitle: {
        fontSize: 18,
        color: '#666',
        padding: 20,
        paddingBottom: 0,
    },
    list: {
        padding: 20,
    },
    searchContainer: {
        padding: 20,
        paddingBottom: 0,
    },
    searchInput: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        fontSize: 18,
        borderWidth: 1,
        borderColor: '#ddd',
        elevation: 1,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
        backgroundColor: '#eee',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    currentStock: {
        fontSize: 14,
        color: '#888',
    },
    addButton: {
        backgroundColor: '#eafbf9',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
    },
    addButtonText: {
        color: '#4ECDC4',
        fontWeight: 'bold',
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        width: '85%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 30,
        alignItems: 'center',
        elevation: 5,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        width: '100%',
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 25,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 15,
        width: '100%',
        justifyContent: 'center',
    },
    modalBtn: {
        flex: 1,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    cancelBtn: {
        backgroundColor: '#FF6B6B',
    },
    confirmBtn: {
        backgroundColor: '#4ECDC4',
    },
    modalBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    }
});

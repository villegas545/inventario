
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { useInventory } from '../context/InventoryContext';

// Define interfaces for state
interface SessionLogItem {
    productName: string;
    action: 'used' | 'restocked';
    amount: number;
    unit: string;
    initialQty: number;
    finalQty: number;
}

interface PendingAction {
    amount?: number;
    direction: 'next' | 'prev';
    isZeroStock?: boolean;
    isEmptyUsage?: boolean;
}

export default function UserProductScreen({ navigation }: { navigation: any }) {
    const { products, updateProductQuantity, logout } = useInventory();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [useAmount, setUseAmount] = useState('');

    // Session Log State
    const [sessionLog, setSessionLog] = useState<SessionLogItem[]>([]);

    // Custom Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [restockMode, setRestockMode] = useState(false);
    const [restockAmount, setRestockAmount] = useState('');

    if (!products || products.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Cargando productos...</Text>
            </View>
        );
    }

    const product = products[currentIndex];

    // Helper to log actions
    const addToLog = (actionType: 'used' | 'restocked', amount: number, initialQty: number, finalQty: number) => {
        setSessionLog(prev => [...prev, {
            productName: product.name,
            action: actionType,
            amount: amount,
            unit: product.unit,
            initialQty: initialQty,
            finalQty: finalQty
        }]);
    };

    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const processUsageAndNavigate = (direction: 'next' | 'prev') => {
        // If input is empty, Trigger "No Usage" Confirmation
        if (!useAmount) {
            setPendingAction({ direction, isEmptyUsage: true });
            setModalVisible(true);
            return;
        }

        const amount = parseInt(useAmount);

        // Validation: Check for letters or invalid numbers
        if (isNaN(amount) || amount <= 0) {
            setErrorMessage("Solo se aceptan números válidos (mayores a 0).");
            setErrorModalVisible(true);
            return;
        }

        // Validation: Check if usage exceeds stock
        if (product.quantity < amount) {
            setErrorMessage(`Solo tienes ${product.quantity} ${product.unit}. No puedes registrar ${amount}.`);
            setErrorModalVisible(true);
            return;
        }

        // Check for Zero Stock trigger
        if (product.quantity - amount === 0) {
            // Trigger Zero Stock Flow
            setPendingAction({ amount, direction, isZeroStock: true });
            setModalVisible(true);
            return;
        }

        // Standard Usage Flow
        setPendingAction({ amount, direction, isZeroStock: false });
        setModalVisible(true);
    };

    const confirmPendingAction = () => {
        if (pendingAction) {
            // Case 1: Empty Usage Confirmation
            if (pendingAction.isEmptyUsage) {
                // No log needed for skip
                resetAndNavigate(pendingAction.direction);
                return;
            }

            // Case 2: Restock Mode
            if (restockMode) {
                const rAmount = parseInt(restockAmount);
                if (isNaN(rAmount) || rAmount <= 0) {
                    Alert.alert("Error", "Ingresa una cantidad válida para reponer.");
                    return;
                }

                const usageAmount = pendingAction.amount || 0;

                // Log Usage (Bringing to 0)
                addToLog('used', usageAmount, product.quantity, 0);

                updateProductQuantity(product.id, -usageAmount);

                setTimeout(() => {
                    updateProductQuantity(product.id, rAmount);
                    // Log Restock
                    addToLog('restocked', rAmount, 0, rAmount);
                }, 50);

                resetAndNavigate(pendingAction.direction);
                Alert.alert("Repuesto", `Se agregaron ${rAmount} nuevas unidades.`);
            }
            // Case 3: Zero Stock Warning Confirmed (Transition to Restock Mode)
            else if (pendingAction.isZeroStock && !restockMode) {
                setRestockMode(true);
                return;
            }
            // Case 4: Standard Usage
            else {
                const usageAmount = pendingAction.amount || 0;
                const currentQty = product.quantity;
                const newQty = currentQty - usageAmount;

                updateProductQuantity(product.id, -usageAmount);
                addToLog('used', usageAmount, currentQty, newQty);
                resetAndNavigate(pendingAction.direction);
            }
        }
    };

    const handleRestockDecline = () => {
        if (pendingAction) {
            const usageAmount = pendingAction.amount || 0;
            const currentQty = product.quantity;
            const newQty = 0;

            updateProductQuantity(product.id, -usageAmount);
            addToLog('used', usageAmount, currentQty, newQty);
            resetAndNavigate(pendingAction.direction);
        }
    };

    const resetAndNavigate = (direction: 'next' | 'prev') => {
        setUseAmount('');
        setRestockAmount('');
        setModalVisible(false);
        setRestockMode(false);
        setPendingAction(null);
        navigate(direction);
    }

    const cancelPendingAction = () => {
        setModalVisible(false);
        setPendingAction(null);
        setRestockMode(false);
        setRestockAmount('');
    };

    const navigate = (direction: 'next' | 'prev') => {
        if (direction === 'next') {
            if (currentIndex < products.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setUseAmount('');
            } else {
                // END OF LIST -> Navigate to Summary
                navigation.replace('Summary', { sessionLog: sessionLog });
            }
        } else {
            if (currentIndex > 0) {
                setCurrentIndex(currentIndex - 1);
                setUseAmount('');
            }
        }
    };

    const handleNext = () => processUsageAndNavigate('next');
    const handlePrev = () => processUsageAndNavigate('prev');

    const handleCancel = () => {
        // Cancel entire flow and go back to dashboard
        navigation.navigate('UserDashboard');
    }

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };

        const datePart = date.toLocaleDateString('es-ES', dateOptions);
        const capitalizedDate = datePart.charAt(0).toUpperCase() + datePart.slice(1);
        const timePart = date.toLocaleTimeString('es-ES', timeOptions);

        return `${capitalizedDate} - ${timePart}`;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCancel} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Cancelar</Text>
                </TouchableOpacity>
                <Text style={styles.stepText}>Producto {currentIndex + 1} de {products.length}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Image
                    source={{ uri: product.image }}
                    style={styles.image}
                    resizeMode="contain"
                />

                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.description}>{product.description}</Text>

                <View style={styles.quantityContainer}>
                    <Text style={styles.quantityLabel}>Hay:</Text>
                    <Text style={styles.quantityValue}>{product.quantity} {product.unit}</Text>
                </View>

                <View style={styles.actionCard}>
                    <Text style={styles.actionTitle}>¿Usaste algo hoy?</Text>
                    <Text style={styles.actionSubtitle}>(Escribe cuánto y da Siguiente)</Text>

                    <View style={styles.inputRow}>
                        <TextInput
                            style={styles.input}
                            value={useAmount}
                            onChangeText={setUseAmount}
                            placeholder="#"
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                {product.history && product.history.length > 0 && (
                    <View style={styles.historyContainer}>
                        <Text style={styles.historyTitle}>Últimos movimientos:</Text>
                        {product.history.map((item, index) => (
                            <View key={index} style={styles.historyItem}>
                                <Text style={styles.historyTime}>{formatDate(item.timestamp)}</Text>
                                <Text style={styles.historyText}>
                                    {item.amount < 0 ? `Restaste ${Math.abs(item.amount)}` : `Agregaste ${item.amount}`}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
                    onPress={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <Text style={styles.navButtonText}>Anterior</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navButton, styles.nextButton]}
                    onPress={handleNext}
                >
                    <Text style={styles.navButtonText}>
                        {/* Visual cue text changes based on input */}
                        {useAmount ? 'Check y Siguiente' : (currentIndex === products.length - 1 ? 'Terminar' : 'Siguiente')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Custom Confirmation Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={cancelPendingAction}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        {!restockMode ? (
                            <>
                                <Text style={styles.modalText}>
                                    {pendingAction && pendingAction.isZeroStock
                                        ? "¡ATENCIÓN! Se acabará el producto. ¿Confirmas?"
                                        : (pendingAction && pendingAction.isEmptyUsage
                                            ? "¿Confirmas que NO hubo consumo?"
                                            : "¿Confirmas que usaste el producto?")}
                                </Text>

                                {!pendingAction?.isEmptyUsage && (
                                    <Text style={styles.modalAmount}>
                                        {pendingAction ? `${pendingAction.amount} ${product.unit}` : ''}
                                    </Text>
                                )}

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalBtn, styles.cancelBtn]}
                                        onPress={cancelPendingAction}
                                    >
                                        <Text style={styles.modalBtnText}>No, Corregir</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalBtn, styles.confirmBtn]}
                                        onPress={confirmPendingAction}
                                    >
                                        <Text style={styles.modalBtnText}>SÍ, CONFIRMAR</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={[styles.modalText, { color: '#FF6B6B' }]}>
                                    ¡SE TERMINÓ!
                                </Text>
                                <Text style={styles.modalSubText}>
                                    ¿Deseas agregar más inventario ahora?
                                </Text>
                                <TextInput
                                    style={[styles.input, { marginBottom: 20, borderColor: '#4ECDC4' }]}
                                    value={restockAmount}
                                    onChangeText={setRestockAmount}
                                    placeholder="Cantidad"
                                    keyboardType="numeric"
                                    autoFocus={true}
                                />

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity
                                        style={[styles.modalBtn, styles.cancelBtn]}
                                        onPress={handleRestockDecline}
                                    >
                                        <Text style={styles.modalBtnText}>No, dejar en 0</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.modalBtn, styles.confirmBtn]}
                                        onPress={confirmPendingAction}
                                    >
                                        <Text style={styles.modalBtnText}>SÍ, AGREGAR</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Error Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={errorModalVisible}
                onRequestClose={() => setErrorModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={[styles.modalText, { color: '#FF6B6B' }]}>
                            ¡Atención!
                        </Text>
                        <Text style={styles.modalSubText}>
                            {errorMessage}
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.confirmBtn]}
                                onPress={() => setErrorModalVisible(false)}
                            >
                                <Text style={styles.modalBtnText}>Entendido</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
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
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    logoutButton: {
        padding: 10,
    },
    logoutText: {
        fontSize: 18,
        color: '#FF6B6B',
        fontWeight: 'bold',
    },
    stepText: {
        fontSize: 18,
        color: '#666',
    },
    content: {
        padding: 20,
        alignItems: 'center',
    },
    image: {
        width: 150,
        height: 150,
        marginBottom: 10,
    },
    productName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 5,
    },
    description: {
        fontSize: 18,
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
        fontStyle: 'italic',
    },
    quantityContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '100%',
        justifyContent: 'center',
        gap: 15,
        borderWidth: 2,
        borderColor: '#4ECDC4',
    },
    quantityLabel: {
        fontSize: 24,
        color: '#666',
    },
    quantityValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
    },
    actionCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        width: '100%',
        alignItems: 'center',
        elevation: 3,
        marginBottom: 20,
    },
    actionTitle: {
        fontSize: 22,
        marginBottom: 5,
        color: '#333',
    },
    actionSubtitle: {
        fontSize: 16,
        color: '#888',
        marginBottom: 15,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    input: {
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 10,
        width: 120,
        height: 70,
        fontSize: 32,
        textAlign: 'center',
        color: '#333',
        backgroundColor: '#fafafa',
    },
    historyContainer: {
        width: '100%',
        padding: 15,
        backgroundColor: '#eef',
        borderRadius: 10,
    },
    historyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#444',
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    historyTime: {
        fontSize: 14,
        color: '#666',
    },
    historyText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: '#fff',
        gap: 20,
        marginTop: 'auto',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    navButton: {
        flex: 1,
        padding: 20,
        backgroundColor: '#ddd',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    nextButton: {
        backgroundColor: '#4ECDC4',
    },
    disabledButton: {
        opacity: 0.3,
    },
    navButtonText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    // Modal Styles
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxWidth: 400,
    },
    modalText: {
        marginBottom: 5,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    modalSubText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        color: '#666',
    },
    modalAmount: {
        fontSize: 36,
        fontWeight: '900',
        color: '#4ECDC4',
        marginBottom: 30,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 20,
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    modalBtn: {
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        elevation: 2,
        minWidth: 100,
    },
    confirmBtn: {
        backgroundColor: '#4ECDC4',
    },
    cancelBtn: {
        backgroundColor: '#FF6B6B',
    },
    modalBtnText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});


import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function SummaryScreen({ navigation, route }) {
    const { logout } = useInventory();
    const { sessionLog } = route.params || { sessionLog: [] };
    const [modalVisible, setModalVisible] = useState(false);

    // Filter out skipped items just in case, though we only push actual changes
    const changes = sessionLog || [];

    const handleConfirmAll = () => {
        setModalVisible(true);
    };

    const handleFinalize = () => {
        setModalVisible(false);
        // Return to Dashboard 
        navigation.navigate('UserDashboard');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Resumen de Movimientos</Text>
            <Text style={styles.subtitle}>Revisa lo que registraste hoy:</Text>

            <ScrollView style={styles.list}>
                {changes.length === 0 ? (
                    <Text style={styles.emptyText}>No registraste cambios en esta sesión.</Text>
                ) : (
                    changes.map((item, index) => (
                        <View key={index} style={styles.card}>
                            <Text style={styles.productName}>{item.productName}</Text>

                            <View style={styles.detailsRow}>
                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Había:</Text>
                                    <Text style={styles.detailValue}>{item.initialQty} {item.unit}</Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={[
                                        styles.detailLabel,
                                        item.action === 'restocked' ? styles.restockColor : styles.usageColor
                                    ]}>
                                        {item.action === 'restocked' ? 'Agregaste:' : 'Usaste:'}
                                    </Text>
                                    <Text style={[
                                        styles.amountText,
                                        item.action === 'restocked' ? styles.restockColor : styles.usageColor
                                    ]}>
                                        {item.amount} {item.unit}
                                    </Text>
                                </View>

                                <View style={styles.detailItem}>
                                    <Text style={styles.detailLabel}>Quedan:</Text>
                                    <Text style={styles.detailValue}>{item.finalQty} {item.unit}</Text>
                                </View>
                            </View>

                        </View>
                    ))
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmAll}>
                    <Text style={styles.confirmButtonText}>Confirmar Todo</Text>
                </TouchableOpacity>
            </View>

            {/* Final Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>¿Todo Correcto?</Text>
                        <Text style={styles.modalText}>
                            Al confirmar, se cerrará tu sesión.
                        </Text>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalBtnText}>Revisar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.confirmBtn]}
                                onPress={handleFinalize}
                            >
                                <Text style={styles.modalBtnText}>SÍ, TERMINAR</Text>
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
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
        marginTop: 20,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    list: {
        flex: 1,
    },
    emptyText: {
        fontSize: 18,
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        borderLeftWidth: 5,
        borderLeftColor: '#4ECDC4',
        elevation: 2,
    },
    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 10,
        textAlign: 'center',
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },
    detailItem: {
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#888',
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    amountText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    usageColor: {
        color: '#FF6B6B', // Red-ish
    },
    restockColor: {
        color: '#4ECDC4', // Teal/Green-ish
    },
    footer: {
        paddingTop: 20,
    },
    confirmButton: {
        backgroundColor: '#4ECDC4',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
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
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    modalText: {
        fontSize: 18,
        marginBottom: 25,
        textAlign: 'center',
        color: '#555',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 20,
    },
    modalBtn: {
        padding: 15,
        borderRadius: 10,
        minWidth: 120,
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
        fontSize: 16,
        fontWeight: 'bold',
    },
});


import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useInventory } from '../context/InventoryContext';

// Locale is already configured in HistoryScreen.tsx or global file, 
// but it doesn't hurt to ensure it's available or rely on the global configuration if possible.
// For safety, we can re-ensure it here or assume singleton behavior.
// LocaleConfig.locales['es'] ... (omitted if assumed loaded, but safer to include if generic)

export default function ProductHistoryScreen({ navigation, route }) {
    const { productId } = route.params;
    const { products } = useInventory();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dateModalVisible, setDateModalVisible] = useState(false);

    const product = products.find(p => p.id === productId);

    if (!product) {
        return (
            <View style={styles.container}>
                <Text>Producto no encontrado</Text>
            </View>
        );
    }

    const history = useMemo(() =>
        (product.history || []).sort((a, b) => b.timestamp - a.timestamp),
        [product.history]);

    // Unique dates (YYYY-MM-DD)
    const uniqueDates = useMemo(() => {
        const dates = history.map(h => new Date(h.timestamp).toISOString().split('T')[0]);
        return Array.from(new Set(dates)).sort();
    }, [history]);

    // Filter Logic
    const filteredHistory = history.filter(item => {
        if (!selectedDate) return true;
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        return itemDate === selectedDate;
    });

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const dateOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        const datePart = date.toLocaleDateString('es-ES', dateOptions);
        const capitalizedDate = datePart.charAt(0).toUpperCase() + datePart.slice(1);
        const timePart = date.toLocaleTimeString('es-ES', timeOptions);
        return { fullDate: capitalizedDate, time: timePart };
    };

    const renderItem = ({ item }) => {
        const { fullDate, time } = formatDate(item.timestamp);
        const isRestock = item.amount > 0;

        return (
            <View style={styles.card}>
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{fullDate}</Text>
                    <Text style={styles.timeText}>{time}</Text>
                </View>
                <View style={styles.infoContainer}>
                    <Text style={[styles.actionText, isRestock ? styles.restock : styles.usage]}>
                        {isRestock ? 'Agregaste' : 'Usaste'} {Math.abs(item.amount)} {product.unit}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title} numberOfLines={1}>Historial: {product.name}</Text>
            </View>

            <View style={styles.productSummary}>
                <Image source={{ uri: product.image }} style={styles.image} />
                <View>
                    <Text style={styles.currentStockLabel}>Stock Actual:</Text>
                    <Text style={styles.currentStockValue}>{product.quantity} {product.unit}</Text>
                </View>
            </View>

            {uniqueDates.length > 0 && (
                <>
                    <TouchableOpacity
                        style={styles.dateFilterButton}
                        onPress={() => setDateModalVisible(true)}
                    >
                        <Text style={styles.dateFilterButtonText}>
                            {selectedDate ? `📅 ${selectedDate}` : "📅 Filtrar por Fecha"}
                        </Text>
                        {selectedDate && (
                            <TouchableOpacity onPress={() => setSelectedDate(null)} style={styles.clearDateBtn}>
                                <Text style={styles.clearDateText}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={dateModalVisible}
                        onRequestClose={() => setDateModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Filtrar por Fecha</Text>
                                    <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                                        <Text style={styles.closeModalText}>Cerrar</Text>
                                    </TouchableOpacity>
                                </View>

                                <Calendar
                                    // Mark dates that have records
                                    markedDates={uniqueDates.reduce((acc, date) => {
                                        acc[date] = {
                                            selected: true,
                                            selectedColor: '#4ECDC4',
                                            marked: true
                                        };
                                        return acc;
                                    }, {
                                        ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#FF6B6B', marked: true } } : {})
                                    })}

                                    onDayPress={day => {
                                        const dateStr = day.dateString;
                                        if (uniqueDates.includes(dateStr)) {
                                            setSelectedDate(dateStr);
                                            setDateModalVisible(false);
                                        }
                                    }}

                                    theme={{
                                        todayTextColor: '#FF6B6B',
                                        arrowColor: '#4ECDC4',
                                        textMonthFontWeight: 'bold',
                                        textDayHeaderfontWeight: 'bold',
                                    }}
                                />
                                <View style={styles.legendContainer}>
                                    <Text style={styles.legendText}>* Solo los días marcados son válidos.</Text>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </>
            )}

            {filteredHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay movimientos registrados.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    keyExtractor={(item, index) => `${index}-${item.timestamp}`}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    productSummary: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#eafbf9',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 20,
        backgroundColor: '#fff',
    },
    currentStockLabel: {
        fontSize: 14,
        color: '#666',
    },
    currentStockValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    dateFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eafbf9',
        margin: 20,
        marginTop: 10,
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#4ECDC4',
    },
    dateFilterButtonText: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    clearDateBtn: {
        marginLeft: 10,
        backgroundColor: '#FF6B6B',
        borderRadius: 10,
        width: 20,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearDateText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        maxHeight: '90%',
        width: '100%',
        maxWidth: 400,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    closeModalText: {
        color: '#FF6B6B',
        fontSize: 16,
        fontWeight: 'bold',
    },
    legendContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    legendText: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
    },
    list: {
        padding: 20,
        paddingTop: 0,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 5,
    },
    dateText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '600',
    },
    timeText: {
        color: '#aaa',
        fontSize: 14,
    },
    infoContainer: {
        alignItems: 'flex-start',
    },
    actionText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    restock: {
        color: '#4ECDC4',
    },
    usage: {
        color: '#FF6B6B',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
    }
});

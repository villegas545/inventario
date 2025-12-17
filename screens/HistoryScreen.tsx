
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useInventory } from '../context/InventoryContext';

// Setup Spanish Locale
LocaleConfig.locales['es'] = {
    monthNames: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.'],
    today: "Hoy"
};
LocaleConfig.defaultLocale = 'es';

export default function HistoryScreen({ navigation }) {
    const { products } = useInventory();
    const [searchText, setSearchText] = useState('');
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dateModalVisible, setDateModalVisible] = useState(false);

    // Flatten logic
    const allHistory = useMemo(() => {
        return products.flatMap(p =>
            (p.history || []).map(h => ({
                ...h,
                productName: p.name,
                productId: p.id,
                unit: p.unit
            }))
        ).sort((a, b) => b.timestamp - a.timestamp);
    }, [products]);

    // Unique dates (YYYY-MM-DD)
    const uniqueDates = useMemo(() => {
        const dates = allHistory.map(h => new Date(h.timestamp).toISOString().split('T')[0]);
        return Array.from(new Set(dates)).sort();
    }, [allHistory]);

    // Filter Logic
    const filteredHistory = allHistory.filter(item => {
        const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
        const matchesSearch = item.productName.toLowerCase().includes(searchText.toLowerCase());
        const matchesDate = selectedDate ? itemDate === selectedDate : true;
        return matchesSearch && matchesDate;
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
                    <Text style={styles.productName}>{item.productName}</Text>
                    <Text style={[styles.actionText, isRestock ? styles.restock : styles.usage]}>
                        {isRestock ? 'Agregaste' : 'Usaste'} {Math.abs(item.amount)} {item.unit}
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
                <Text style={styles.title}>Historial Global</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Buscar en historial..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#999"
                />
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
                                    <Text style={styles.legendText}>* Solo los días marcados en verde tienen registros.</Text>
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
                    keyExtractor={(item, index) => `${item.productId}-${item.timestamp}-${index}`}
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    searchContainer: {
        padding: 20,
        paddingBottom: 10,
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
    dateFilterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#eafbf9',
        margin: 20,
        marginTop: 0,
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
        alignItems: 'center', // Center horizontally
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 15,
        maxHeight: '90%',
        width: '100%',
        maxWidth: 400, // Constrain width for larger screens
        elevation: 5,
        // Ensure calendar fits inside
        overflow: 'hidden',
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
        padding: 5,
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    productName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    actionText: {
        fontSize: 16,
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
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
    }
});

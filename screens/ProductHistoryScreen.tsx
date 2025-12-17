
import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useInventory, Product, HistoryItem } from '../context/InventoryContext';

// Locale is already configured in HistoryScreen.tsx or global file, 
// but it doesn't hurt to ensure it's available or rely on the global configuration if possible.
// For safety, we can re-ensure it here or assume singleton behavior.
// LocaleConfig.locales['es'] ... (omitted if assumed loaded, but safer to include if generic)

export default function ProductHistoryScreen({ navigation, route }: { navigation: any, route: any }) {
    const { productId } = route.params;
    const { products } = useInventory() as { products: Product[] };
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [dateModalVisible, setDateModalVisible] = useState(false);

    const product = products.find(p => p.id === productId);

    if (!product) {
        return (
            <View className="flex-1 bg-[#f5f5f5] justify-center items-center">
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

    const formatDate = (timestamp: number) => {
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

    const renderItem = ({ item }: { item: HistoryItem }) => {
        const { fullDate, time } = formatDate(item.timestamp);

        if (item.type === 'details_edit') {
            return (
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                    <View className="flex-row justify-between mb-2 pb-2 border-b border-[#eee] flex-wrap">
                        <Text className="text-[#888] text-sm font-semibold">{fullDate}</Text>
                        <Text className="text-[#aaa] text-sm">{time}</Text>
                    </View>
                    <View className="items-start">
                        <Text className="text-lg font-bold text-[#F39C12]">
                            Actualización de detalles
                        </Text>
                        <Text className="text-base text-[#555] mt-0.5">
                            Modificado: {item.changes ? item.changes.join(', ') : 'Varios'}
                        </Text>
                        <Text className="text-xs text-[#999] mt-1 italic">Por: {item.user || 'Desconocido'}</Text>
                    </View>
                </View>
            );
        }

        if (item.type === 'edit') {
            return (
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                    <View className="flex-row justify-between mb-2 pb-2 border-b border-[#eee] flex-wrap">
                        <Text className="text-[#888] text-sm font-semibold">{fullDate}</Text>
                        <Text className="text-[#aaa] text-sm">{time}</Text>
                    </View>
                    <View className="items-start">
                        <Text className="text-lg font-bold text-[#FFA500]">
                            Ajuste de inventario
                        </Text>
                        <Text className="text-base text-[#555] mt-0.5">
                            De {item.previous} a {item.new} {product.unit}
                        </Text>
                        <Text className="text-xs text-[#999] mt-1 italic">Por: {item.user || 'Desconocido'}</Text>
                    </View>
                </View>
            );
        }

        const isRestock = (item.amount || 0) > 0;
        return (
            <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                <View className="flex-row justify-between mb-2 pb-2 border-b border-[#eee] flex-wrap">
                    <Text className="text-[#888] text-sm font-semibold">{fullDate}</Text>
                    <Text className="text-[#aaa] text-sm">{time}</Text>
                </View>
                <View className="items-start">
                    <Text className={`text-lg font-bold ${isRestock ? 'text-[#4ECDC4]' : 'text-[#FF6B6B]'}`}>
                        {isRestock ? 'Agregaste' : 'Usaste'} {Math.abs(item.amount || 0)} {product.unit}
                    </Text>
                    {item.previous !== undefined && item.new !== undefined && (
                        <Text className="text-base text-[#555] mt-0.5">
                            De {item.previous} a {item.new} {product.unit}
                        </Text>
                    )}
                    <Text className="text-xs text-[#999] mt-1 italic">Por: {item.user || 'Desconocido'}</Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-[#f5f5f5]">
            <View className="flex-row items-center p-5 bg-white border-b border-[#ddd]">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2">
                    <Text className="text-lg text-[#666]">← Volver</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-[#333] flex-1" numberOfLines={1}>Historial: {product.name}</Text>
            </View>

            <View className="flex-row items-center p-5 bg-[#eafbf9] border-b border-[#ddd]">
                <Image source={{ uri: product.image }} className="w-16 h-16 rounded-full mr-5 bg-white" />
                <View>
                    <Text className="text-sm text-[#666]">Stock Actual:</Text>
                    <Text className="text-2xl font-bold text-[#333]">{product.quantity} {product.unit}</Text>
                </View>
            </View>

            {uniqueDates.length > 0 && (
                <>
                    <TouchableOpacity
                        className="flex-row items-center justify-center bg-[#eafbf9] mx-5 my-2 mb-2 p-4 rounded-xl border border-[#4ECDC4]"
                        onPress={() => setDateModalVisible(true)}
                    >
                        <Text className="text-base text-[#333] font-bold">
                            {selectedDate ? `📅 ${selectedDate}` : "📅 Filtrar por Fecha"}
                        </Text>
                        {selectedDate && (
                            <TouchableOpacity onPress={() => setSelectedDate(null)} className="ml-2 bg-[#FF6B6B] rounded-lg w-5 h-5 items-center justify-center">
                                <Text className="text-white text-xs font-bold">✕</Text>
                            </TouchableOpacity>
                        )}
                    </TouchableOpacity>

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={dateModalVisible}
                        onRequestClose={() => setDateModalVisible(false)}
                    >
                        <View className="flex-1 justify-center items-center bg-black/50 p-5">
                            <View className="bg-white rounded-2xl p-4 max-h-[90%] w-full max-w-[400px]">
                                <View className="flex-row justify-between items-center mb-2 pb-2 border-b border-[#eee]">
                                    <Text className="text-lg font-bold text-[#333]">Filtrar por Fecha</Text>
                                    <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                                        <Text className="text-[#FF6B6B] text-base font-bold">Cerrar</Text>
                                    </TouchableOpacity>
                                </View>

                                <Calendar
                                    // Mark dates that have records
                                    markedDates={uniqueDates.reduce((acc: any, date: string) => {
                                        acc[date] = {
                                            selected: true,
                                            selectedColor: '#4ECDC4',
                                            marked: true
                                        };
                                        return acc;
                                    }, {
                                        ...(selectedDate ? { [selectedDate]: { selected: true, selectedColor: '#FF6B6B', marked: true } } : {})
                                    })}

                                    onDayPress={(day: any) => {
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
                                        textDayHeaderFontWeight: 'bold',
                                    }}
                                />
                                <View className="mt-2 p-2 bg-[#f5f5f5] rounded-lg">
                                    <Text className="text-xs text-[#666] italic text-center">* Solo los días marcados son válidos.</Text>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </>
            )}

            {filteredHistory.length === 0 ? (
                <View className="flex-1 justify-center items-center">
                    <Text className="text-lg text-[#999]">No hay movimientos registrados.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    keyExtractor={(item, index) => `${index}-${item.timestamp}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20, paddingTop: 0 }}
                />
            )}
        </View>
    );
}

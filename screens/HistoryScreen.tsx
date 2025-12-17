
import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useInventory, Product, HistoryItem } from '../context/InventoryContext';
import { formatDate } from '../utils/dateUtils';

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

export default function HistoryScreen({ navigation }: { navigation: any }) {
    const { products } = useInventory() as { products: Product[] };
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
        ).sort((a: any, b: any) => b.timestamp - a.timestamp);
    }, [products]);

    // Unique dates (YYYY-MM-DD)
    const uniqueDates: string[] = useMemo(() => {
        const dates = allHistory.map((h: any) => new Date(h.timestamp).toISOString().split('T')[0]);
        return Array.from<string>(new Set(dates)).sort();
    }, [allHistory]);

    // Filter Logic
    const filteredHistory = useMemo(() => {
        return allHistory.filter((item: any) => {
            const itemDate = new Date(item.timestamp).toISOString().split('T')[0];
            const matchesSearch = item.productName.toLowerCase().includes(searchText.toLowerCase());
            const matchesDate = selectedDate ? itemDate === selectedDate : true;
            return matchesSearch && matchesDate;
        });
    }, [allHistory, searchText, selectedDate]);

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const { fullDate, time } = formatDate(item.timestamp);

        // Check if previous item has same date
        let showDateHeader = true;
        if (index > 0) {
            const prevItem = filteredHistory[index - 1];
            const { fullDate: prevDate } = formatDate(prevItem.timestamp);
            if (prevDate === fullDate) {
                showDateHeader = false;
            }
        }

        let content;
        if (item.type === 'details_edit') {
            content = (
                <View className="flex-row justify-between items-center">
                    <View className="flex-1 mr-4 justify-center">
                        <Text className="text-lg font-bold text-[#333]">{item.productName}</Text>
                        <Text className="text-xs text-[#999] italic">Por: {item.user || 'Desconocido'}</Text>
                    </View>
                    <View className="items-end shrink-0 max-w-[45%]">
                        <Text className="text-base font-bold text-[#F39C12]">
                            Detalles
                        </Text>
                        <Text className="text-sm text-[#555] mt-0.5">
                            {item.changes ? item.changes.join(', ') : 'Varios'}
                        </Text>
                        <Text className="text-[#aaa] text-sm">{time}</Text>
                    </View>
                </View>
            );
        } else if (item.type === 'edit') {
            content = (
                <View className="flex-row justify-between items-center">
                    <View className="flex-1 mr-4 justify-center">
                        <Text className="text-lg font-bold text-[#333]">{item.productName}</Text>
                        <Text className="text-xs text-[#999] italic">Por: {item.user || 'Desconocido'}</Text>
                    </View>
                    <View className="items-end shrink-0 max-w-[45%]">
                        <Text className="text-base font-bold text-[#FFA500]">
                            Ajuste
                        </Text>
                        <Text className="text-sm text-[#555] mt-0.5">
                            {item.previous} ➔ {item.new}
                        </Text>
                        <Text className="text-[#aaa] text-sm">{time}</Text>
                    </View>
                </View>
            );
        } else {
            const isRestock = item.amount > 0;
            content = (
                <View className="flex-row justify-between items-center">
                    <View className="flex-1 mr-4 justify-center">
                        <Text className="text-lg font-bold text-[#333]">{item.productName}</Text>
                        <Text className="text-xs text-[#999] italic">Por: {item.user || 'Desconocido'}</Text>
                    </View>
                    <View className="items-end shrink-0 max-w-[45%]">
                        <Text className={`text-base font-bold ${isRestock ? 'text-[#4ECDC4]' : 'text-[#FF6B6B]'}`}>
                            {isRestock ? 'Agregaste' : 'Usaste'} {Math.abs(item.amount)} {item.unit}
                        </Text>
                        {item.previous !== undefined && item.new !== undefined && (
                            <Text className="text-sm text-[#555] mt-0.5">
                                De {item.previous} a {item.new}
                            </Text>
                        )}
                        <Text className="text-[#aaa] text-sm">{time}</Text>
                    </View>
                </View>
            );
        }

        return (
            <View>
                {showDateHeader && (
                    <View className="flex-row justify-between mb-2.5 border-b border-[#eee] pb-1">
                        <Text className="text-[#888] text-sm font-semibold">{fullDate}</Text>
                    </View>
                )}
                <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
                    {content}
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
                <Text className="text-2xl font-bold text-[#333]">Historial Global</Text>
            </View>

            <View className="p-5 pb-2.5">
                <TextInput
                    className="bg-white p-4 rounded-xl text-lg border border-[#ddd] shadow-sm"
                    placeholder="🔍 Buscar en historial..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#999"
                />
            </View>

            {uniqueDates.length > 0 && (
                <>
                    <TouchableOpacity
                        className="flex-row items-center justify-center bg-[#eafbf9] mx-5 mt-0 p-4 rounded-xl border border-[#4ECDC4]"
                        onPress={() => setDateModalVisible(true)}
                    >
                        <Text className="text-base text-[#333] font-bold">
                            {selectedDate ? `📅 ${selectedDate}` : "📅 Filtrar por Fecha"}
                        </Text>
                        {selectedDate && (
                            <TouchableOpacity onPress={() => setSelectedDate(null)} className="ml-2.5 bg-[#FF6B6B] rounded-xl w-5 h-5 items-center justify-center">
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
                        <View className="flex-1 bg-black/50 justify-center items-center p-5">
                            <View className="bg-white rounded-2xl p-4 max-h-[90%] w-full max-w-[400px] shadow-lg overflow-hidden">
                                <View className="flex-row justify-between items-center mb-2.5 pb-2.5 border-b border-[#eee]">
                                    <Text className="text-lg font-bold text-[#333]">Filtrar por Fecha</Text>
                                    <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                                        <Text className="text-[#FF6B6B] text-base font-bold p-1">Cerrar</Text>
                                    </TouchableOpacity>
                                </View>

                                <Calendar
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
                                <View className="mt-2.5 p-2.5 bg-[#f5f5f5] rounded-lg">
                                    <Text className="text-xs text-[#666] italic text-center">* Solo los días marcados en verde tienen registros.</Text>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </>
            )}

            {filteredHistory.length === 0 ? (
                <View className="flex-1 justify-center items-center mt-12">
                    <Text className="text-lg text-[#999]">No hay movimientos registrados.</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredHistory}
                    keyExtractor={(item, index) => `${item.productId}-${item.timestamp}-${index}`}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 20, paddingTop: 0 }}
                />
            )}
        </View>
    );
}

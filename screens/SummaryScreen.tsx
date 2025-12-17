
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function SummaryScreen({ navigation, route }: { navigation: any, route: any }) {
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
        navigation.navigate('Dashboard'); // Fixed navigation target to match stack name
    };

    return (
        <View className="flex-1 bg-[#f5f5f5] p-5">
            <Text className="text-3xl font-bold text-[#333] text-center mb-1.5 mt-5">Resumen de Movimientos</Text>
            <Text className="text-lg text-[#666] text-center mb-5">Revisa lo que registraste hoy:</Text>

            <ScrollView className="flex-1">
                {changes.length === 0 ? (
                    <Text className="text-lg text-center text-[#999] mt-12">No registraste cambios en esta sesión.</Text>
                ) : (
                    changes.map((item: any, index: number) => (
                        <View key={index} className="bg-white p-4 rounded-xl mb-2.5 border-l-[5px] border-[#4ECDC4] shadow-sm">
                            <Text className="text-xl font-bold text-[#444] mb-2.5 text-center">{item.productName}</Text>

                            <View className="flex-row justify-around items-start">
                                <View className="items-center">
                                    <Text className="text-sm text-[#888] mb-0.5">Había:</Text>
                                    <Text className="text-lg font-bold text-[#333]">{item.initialQty} {item.unit}</Text>
                                </View>

                                <View className="items-center">
                                    <Text className={`text-sm mb-0.5 ${item.action === 'restocked' ? 'text-[#4ECDC4]' : 'text-[#FF6B6B]'}`}>
                                        {item.action === 'restocked' ? 'Agregaste:' : 'Usaste:'}
                                    </Text>
                                    <Text className={`text-xl font-bold ${item.action === 'restocked' ? 'text-[#4ECDC4]' : 'text-[#FF6B6B]'}`}>
                                        {item.amount} {item.unit}
                                    </Text>
                                </View>

                                <View className="items-center">
                                    <Text className="text-sm text-[#888] mb-0.5">Quedan:</Text>
                                    <Text className="text-lg font-bold text-[#333]">{item.finalQty} {item.unit}</Text>
                                </View>
                            </View>

                        </View>
                    ))
                )}
            </ScrollView>

            <View className="pt-5">
                <TouchableOpacity className="bg-[#4ECDC4] p-5 rounded-2xl items-center" onPress={handleConfirmAll}>
                    <Text className="text-white text-xl font-bold">Confirmar Todo</Text>
                </TouchableOpacity>
            </View>

            {/* Final Confirmation Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="m-5 bg-white rounded-2xl p-8 items-center share-sm w-[90%] max-w-[400px] shadow-lg">
                        <Text className="text-2xl font-bold mb-4 text-[#333]">¿Todo Correcto?</Text>
                        <Text className="text-lg mb-6 text-center text-[#555]">
                            Al confirmar, se cerrará tu sesión.
                        </Text>
                        <View className="flex-row gap-5">
                            <TouchableOpacity
                                className="p-4 rounded-xl min-w-[120px] items-center bg-[#FF6B6B]"
                                onPress={() => setModalVisible(false)}
                            >
                                <Text className="text-white text-base font-bold">Revisar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="p-4 rounded-xl min-w-[120px] items-center bg-[#4ECDC4]"
                                onPress={handleFinalize}
                            >
                                <Text className="text-white text-base font-bold">SÍ, TERMINAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

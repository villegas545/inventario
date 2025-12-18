
import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { useInventory } from '../context/InventoryContext';
import { formatDate } from '../utils/dateUtils';

interface SessionLogItem {
    productId: string; // Added productId
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
    const activeProducts = products.filter((p: any) => p.isActive !== false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [useAmount, setUseAmount] = useState('');

    // Generate unique session ID for this job flow
    const sessionId = React.useMemo(() => `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

    const [sessionLog, setSessionLog] = useState<SessionLogItem[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
    const [restockMode, setRestockMode] = useState(false);
    const [restockAmount, setRestockAmount] = useState('');

    if (!activeProducts || activeProducts.length === 0) {
        return (
            <View className="flex-1 bg-[#f5f5f5] justify-center items-center">
                <Text className="text-2xl font-bold text-[#333]">Cargando productos...</Text>
            </View>
        );
    }

    const product = activeProducts[currentIndex];

    // Helper to log actions
    const addToLog = (actionType: 'used' | 'restocked', amount: number, initialQty: number, finalQty: number) => {
        setSessionLog(prev => [...prev, {
            productId: product.id,
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
        if (!useAmount) {
            setPendingAction({ direction, isEmptyUsage: true });
            setModalVisible(true);
            return;
        }

        const amount = parseInt(useAmount);

        if (isNaN(amount) || amount <= 0) {
            setErrorMessage("Solo se aceptan números válidos (mayores a 0).");
            setErrorModalVisible(true);
            return;
        }

        if (product.quantity < amount) {
            setErrorMessage(`Solo tienes ${product.quantity} ${product.unit}. No puedes registrar ${amount}.`);
            setErrorModalVisible(true);
            return;
        }

        if (product.quantity - amount === 0) {
            setPendingAction({ amount, direction, isZeroStock: true });
            setModalVisible(true);
            return;
        }

        setPendingAction({ amount, direction, isZeroStock: false });
        setModalVisible(true);
    };

    const confirmPendingAction = () => {
        if (pendingAction) {
            if (pendingAction.isEmptyUsage) {
                resetAndNavigate(pendingAction.direction);
                return;
            }

            if (restockMode) {
                const rAmount = parseInt(restockAmount);
                if (isNaN(rAmount) || rAmount <= 0) {
                    Alert.alert("Error", "Ingresa una cantidad válida para reponer.");
                    return;
                }

                const usageAmount = pendingAction.amount || 0;

                addToLog('used', usageAmount, product.quantity, 0);
                updateProductQuantity(product.id, -usageAmount, sessionId);

                setTimeout(() => {
                    updateProductQuantity(product.id, rAmount, sessionId);
                    addToLog('restocked', rAmount, 0, rAmount);
                }, 50);

                resetAndNavigate(pendingAction.direction);
                Alert.alert("Repuesto", `Se agregaron ${rAmount} nuevas unidades.`);
            }
            else if (pendingAction.isZeroStock && !restockMode) {
                setRestockMode(true);
                return;
            }
            else {
                const usageAmount = pendingAction.amount || 0;
                const currentQty = product.quantity;
                updateProductQuantity(product.id, -usageAmount, sessionId);
                addToLog('used', usageAmount, currentQty, currentQty - usageAmount);
                resetAndNavigate(pendingAction.direction);
            }
        }
    };

    const handleRestockDecline = () => {
        if (pendingAction) {
            const usageAmount = pendingAction.amount || 0;
            const currentQty = product.quantity;
            updateProductQuantity(product.id, -usageAmount, sessionId);
            addToLog('used', usageAmount, currentQty, 0);
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
            if (currentIndex < activeProducts.length - 1) {
                setCurrentIndex(currentIndex + 1);
                setUseAmount('');
            } else {
                navigation.replace('Summary', { sessionLog: sessionLog, sessionId: sessionId });
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
        navigation.navigate('Dashboard');
    }

    return (
        <View className="flex-1 bg-[#f5f5f5]">
            <View className="flex-row justify-between p-5 bg-white items-center border-b border-[#ddd]">
                <TouchableOpacity onPress={handleCancel} className="p-2.5">
                    <Text className="text-lg text-[#FF6B6B] font-bold">Cancelar</Text>
                </TouchableOpacity>
                <Text className="text-lg text-[#666]">Producto {currentIndex + 1} de {activeProducts.length}</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>


                <Text className="text-3xl font-bold text-black text-center mb-1.5">{product.name}</Text>
                <Text className="text-lg text-[#555] text-center mb-5 px-2.5 italic">{product.description}</Text>

                <View className="bg-white p-4 rounded-xl flex-row items-center mb-5 w-full justify-center gap-4 border-2 border-[#4ECDC4]">
                    <Text className="text-2xl text-[#666]">Hay:</Text>
                    <Text className="text-3xl font-bold text-[#333]">{product.quantity} {product.unit}</Text>
                </View>

                <View className="bg-white p-5 rounded-xl w-full items-center shadow-md mb-5">
                    <Text className="text-2xl mb-1.5 text-[#333]">¿Usaste algo hoy?</Text>
                    <Text className="text-base text-[#888] mb-4">(Escribe cuánto y da Siguiente)</Text>

                    <View className="flex-row items-center justify-center w-full">
                        <TextInput
                            className="border-2 border-[#ddd] rounded-xl w-[120px] h-[70px] text-3xl text-center text-[#333] bg-[#fafafa]"
                            value={useAmount}
                            onChangeText={setUseAmount}
                            placeholder="#"
                            keyboardType="numeric"
                            placeholderTextColor="#999"
                        />
                    </View>
                </View>

                {(product.history || []).length > 0 && (
                    <View className="w-full p-4 bg-[#eef] rounded-xl">
                        <Text className="text-lg font-bold mb-2.5 text-[#444]">Últimos movimientos:</Text>
                        {(product.history || []).map((item, index) => {
                            const { fullDate, time } = formatDate(item.timestamp);
                            return (
                                <View key={index} className="flex-col py-2 border-b border-[#ccc]">
                                    <Text className="text-sm text-[#666] mb-1">{fullDate} - {time}</Text>
                                    <Text className="text-base text-[#333] font-medium">
                                        {item.amount && item.amount < 0 ? `Restaste ${Math.abs(item.amount)}` : `Agregaste ${item.amount}`}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            <View className="flex-row p-5 bg-white gap-5 mt-auto border-t border-[#ddd]">
                <TouchableOpacity
                    className={`flex-1 p-5 bg-[#ddd] rounded-xl items-center justify-center ${currentIndex === 0 ? 'opacity-30' : ''}`}
                    onPress={handlePrev}
                    disabled={currentIndex === 0}
                >
                    <Text className="text-xl font-bold text-[#333] text-center">Anterior</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="flex-1 p-5 bg-[#4ECDC4] rounded-xl items-center justify-center"
                    onPress={handleNext}
                >
                    <Text className="text-xl font-bold text-[#333] text-center">
                        {useAmount ? 'Check y Siguiente' : (currentIndex === activeProducts.length - 1 ? 'Terminar' : 'Siguiente')}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={cancelPendingAction}
            >
                <View className="flex-1 justify-center items-center bg-black/50 p-5">
                    <View className="bg-white rounded-2xl p-8 items-center shadow-lg w-full max-w-[400px]">
                        {!restockMode ? (
                            <>
                                <Text className="mb-1 text-center text-2xl font-bold text-[#333]">
                                    {pendingAction && pendingAction.isZeroStock
                                        ? "¡ATENCIÓN! Se acabará el producto. ¿Confirmas?"
                                        : (pendingAction && pendingAction.isEmptyUsage
                                            ? "¿Confirmas que NO hubo consumo?"
                                            : "¿Confirmas que usaste el producto?")}
                                </Text>

                                {!pendingAction?.isEmptyUsage && (
                                    <Text className="text-4xl font-extrabold text-[#4ECDC4] mb-8">
                                        {pendingAction ? `${pendingAction.amount} ${product.unit}` : ''}
                                    </Text>
                                )}

                                <View className="flex-row gap-5 justify-center flex-wrap">
                                    <TouchableOpacity
                                        className="py-4 px-4 rounded-xl elevation-2 min-w-[100px] bg-[#FF6B6B]"
                                        onPress={cancelPendingAction}
                                    >
                                        <Text className="text-white font-bold text-center text-base">No, Corregir</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="py-4 px-4 rounded-xl elevation-2 min-w-[100px] bg-[#4ECDC4]"
                                        onPress={confirmPendingAction}
                                    >
                                        <Text className="text-white font-bold text-center text-base">SÍ, CONFIRMAR</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <>
                                <Text className="mb-1 text-center text-2xl font-bold text-[#FF6B6B]">
                                    ¡SE TERMINÓ!
                                </Text>
                                <Text className="mb-4 text-center text-lg text-[#666]">
                                    ¿Deseas agregar más inventario ahora?
                                </Text>
                                <TextInput
                                    className="bg-[#f9f9f9] border-b-2 border-[#4ECDC4] mb-5 w-full text-center text-2xl p-2"
                                    value={restockAmount}
                                    onChangeText={setRestockAmount}
                                    placeholder="Cantidad"
                                    keyboardType="numeric"
                                    autoFocus={true}
                                />

                                <View className="flex-row gap-5 justify-center flex-wrap">
                                    <TouchableOpacity
                                        className="py-4 px-4 rounded-xl elevation-2 min-w-[100px] bg-[#FF6B6B]"
                                        onPress={handleRestockDecline}
                                    >
                                        <Text className="text-white font-bold text-center text-base">No, dejar en 0</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="py-4 px-4 rounded-xl elevation-2 min-w-[100px] bg-[#4ECDC4]"
                                        onPress={confirmPendingAction}
                                    >
                                        <Text className="text-white font-bold text-center text-base">SÍ, AGREGAR</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                transparent={true}
                visible={errorModalVisible}
                onRequestClose={() => setErrorModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50 p-5">
                    <View className="bg-white rounded-2xl p-8 items-center shadow-lg w-full max-w-[400px]">
                        <Text className="mb-1 text-center text-2xl font-bold text-[#FF6B6B]">
                            ¡Atención!
                        </Text>
                        <Text className="mb-4 text-center text-lg text-[#666]">
                            {errorMessage}
                        </Text>
                        <View className="flex-row justify-center">
                            <TouchableOpacity
                                className="py-4 px-4 rounded-xl elevation-2 min-w-[100px] bg-[#4ECDC4]"
                                onPress={() => setErrorModalVisible(false)}
                            >
                                <Text className="text-white font-bold text-center text-base">Entendido</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}


import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function LastJobScreen({ navigation }: { navigation: any }) {
    const { getLastJob, rollbackJob, loading } = useInventory();
    const [job, setJob] = useState<any>(null);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        loadLastJob();
    }, []);

    const loadLastJob = async () => {
        setIsFetching(true);
        const lastJob = await getLastJob();
        setJob(lastJob);
        setIsFetching(false);
    };

    const handleRollback = () => {
        if (!job) return;

        Alert.alert(
            "⚠️ Deshacer Trabajo",
            `Estás a punto de revertir el último trabajo realizado por ${job.user}. \n\nSe revertirán ${job.summary?.length || 0} movimientos y se eliminarán del historial.\n\n¿Estás seguro?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sí, Revertir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await rollbackJob(job);
                            Alert.alert("Éxito", "El trabajo ha sido revertido correctamente.");
                            navigation.goBack();
                        } catch (error) {
                            Alert.alert("Error", "Ocurrió un error al intentar revertir el trabajo.");
                        }
                    }
                }
            ]
        );
    };

    if (isFetching) {
        return (
            <View className="flex-1 bg-[#f5f5f5] justify-center items-center">
                <ActivityIndicator size="large" color="#4ECDC4" />
                <Text className="text-[#666] mt-4">Buscando último trabajo...</Text>
            </View>
        );
    }

    if (!job) {
        return (
            <View className="flex-1 bg-[#f5f5f5] p-5">
                <View className="flex-row items-center mb-5">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2 bg-white rounded-full">
                        <Text className="text-lg text-[#666]">←</Text>
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold text-[#333]">Último Trabajo</Text>
                </View>
                <View className="bg-white p-8 rounded-2xl items-center shadow-sm">
                    <Text className="text-lg text-[#999] text-center">No se encontraron registros recientes de trabajos.</Text>
                </View>
            </View>
        );
    }

    const dateStr = new Date(job.timestamp).toLocaleString();

    return (
        <View className="flex-1 bg-[#f5f5f5]">
            <View className="flex-row items-center p-5 bg-white border-b border-[#ddd]">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2">
                    <Text className="text-lg text-[#666]">← Volver</Text>
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-[#333]">Último Trabajo</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <View className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                    <Text className="text-sm text-[#888] mb-1">Realizado por:</Text>
                    <Text className="text-xl font-bold text-[#333] mb-4">{job.user} ({job.role})</Text>

                    <Text className="text-sm text-[#888] mb-1">Fecha:</Text>
                    <Text className="text-base text-[#555] mb-4">{dateStr}</Text>

                    <Text className="text-sm text-[#888] mb-2">Resumen de Cambios:</Text>
                    <View className="bg-[#f9f9f9] p-4 rounded-xl">
                        {(job.summary || []).map((line: string, index: number) => (
                            <Text key={index} className="text-[#444] mb-1.5">• {line}</Text>
                        ))}
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#FF6B6B" />
                ) : (
                    <TouchableOpacity
                        className="bg-[#ffeaea] p-5 rounded-2xl items-center border border-[#ffcccc] shadow-sm"
                        onPress={handleRollback}
                    >
                        <Text className="text-[#FF6B6B] text-xl font-bold">↺ Deshacer (Rollback)</Text>
                        <Text className="text-sm text-[#d48c8c] mt-1 text-center">Revertirá inventario y borrará historial</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

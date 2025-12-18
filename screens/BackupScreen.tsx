import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useInventory } from '../context/InventoryContext';

export default function BackupScreen({ navigation }: { navigation: any }) {
    const { products, restoreDatabase } = useInventory();
    const [isLoading, setIsLoading] = useState(false);

    const handleDownloadBackup = async () => {
        try {
            const backupData = JSON.stringify(products, null, 2);
            const fileName = `backup_productos_${new Date().toISOString().split('T')[0]}.json`;

            if (Platform.OS === 'web') {
                const blob = new Blob([backupData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                Alert.alert("Éxito", "El respaldo se ha descargado correctamente.");
            } else {
                const fileUri = ((FileSystem as any).documentDirectory || (FileSystem as any).cacheDirectory) + fileName;
                await FileSystem.writeAsStringAsync(fileUri, backupData, {
                    encoding: 'utf8'
                });

                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(fileUri);
                } else {
                    Alert.alert("Información", `Archivo guardado en: ${fileUri}`);
                }
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo generar el respaldo.");
        }
    };

    const handleRestoreBackup = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true
            });

            if (result.canceled) return;

            const file = result.assets[0];

            Alert.alert(
                "⚠️ Restaurar Base de Datos",
                `Estás a punto de eliminar TODA la base de datos actual y reemplazarla con el contenido de "${file.name}". Esta acción es irreversible.\n\n¿Estás seguro?`,
                [
                    { text: "Cancelar", style: "cancel" },
                    {
                        text: "Sí, Restaurar",
                        style: "destructive",
                        onPress: async () => await processRestore(file)
                    }
                ]
            );

        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Error al seleccionar el archivo.");
        }
    };

    const processRestore = async (file: any) => {
        setIsLoading(true);
        try {
            let jsonContent;

            if (Platform.OS === 'web') {
                // Web file reading
                const response = await fetch(file.uri);
                jsonContent = await response.json();
            } else {
                // Native file reading
                const content = await FileSystem.readAsStringAsync(file.uri, { encoding: 'utf8' });
                jsonContent = JSON.parse(content);
            }

            if (!Array.isArray(jsonContent)) {
                throw new Error("El archivo no tiene el formato correcto (debe ser un array de productos).");
            }

            await restoreDatabase(jsonContent);
            Alert.alert("Éxito", "La base de datos ha sido restaurada correctamente.");
            navigation.goBack();

        } catch (error: any) {
            console.error("Restore error:", error);
            Alert.alert("Error Fallido", error.message || "No se pudo restaurar la base de datos.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-[#f5f5f5]">
            <View className="pt-16 pb-8 px-6 bg-[#333] shadow-md">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        className="mr-4 bg-white/20 p-2 rounded-full"
                    >
                        <Text className="text-white font-bold text-xl">←</Text>
                    </TouchableOpacity>
                    <Text className="text-3xl font-bold text-white">Respaldos</Text>
                </View>
                <Text className="text-[#ddd] text-base">
                    Gestiona la seguridad de tus datos. Descarga copias locales o restaura versiones anteriores.
                </Text>
            </View>

            <View className="p-6 flex-1 justify-center space-y-6">

                {/* Download Option */}
                <TouchableOpacity
                    onPress={handleDownloadBackup}
                    className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-[#6c5ce7] active:bg-gray-50 flex-row items-center justify-between"
                >
                    <View className="flex-1 mr-4">
                        <Text className="text-2xl mb-2">💾</Text>
                        <Text className="text-xl font-bold text-[#333] mb-1">Descargar Respaldo</Text>
                        <Text className="text-gray-500 text-sm">
                            Genera un archivo JSON con todos los productos y el historial actual.
                        </Text>
                    </View>
                    <Text className="text-gray-300 text-3xl">→</Text>
                </TouchableOpacity>

                {/* Restore Option */}
                <TouchableOpacity
                    onPress={handleRestoreBackup}
                    className="bg-white p-8 rounded-3xl shadow-sm border-l-8 border-[#ff7675] active:bg-gray-50 flex-row items-center justify-between mt-6"
                >
                    <View className="flex-1 mr-4">
                        <Text className="text-2xl mb-2">🔄</Text>
                        <Text className="text-xl font-bold text-[#333] mb-1">Restaurar Base de Datos</Text>
                        <Text className="text-gray-500 text-sm">
                            Carga un archivo JSON para reemplazar completamente la base de datos actual.
                            {'\n'}
                            <Text className="font-bold text-red-500">⚠️ ¡Acción Destructiva!</Text>
                        </Text>
                    </View>
                    <Text className="text-gray-300 text-3xl">→</Text>
                </TouchableOpacity>

            </View>

            {isLoading && (
                <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
                    <View className="bg-white p-6 rounded-2xl items-center">
                        <ActivityIndicator size="large" color="#6c5ce7" />
                        <Text className="mt-4 text-gray-700 font-bold">Procesando...</Text>
                        <Text className="text-xs text-gray-500 mt-1">Por favor espera, no cierres la app.</Text>
                    </View>
                </View>
            )}
        </View>
    );
}


import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { useInventory } from '../context/InventoryContext';

export default function InventoryScreen({ navigation }) {
    const { products } = useInventory();
    const [searchText, setSearchText] = useState('');

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchText.toLowerCase())
    );

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('ProductHistory', { productId: item.id })}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.tapHint}>(Toca para ver historial)</Text>
            </View>
            <View style={styles.qtyContainer}>
                <Text style={styles.qtyLabel}>Hay</Text>
                <Text style={[
                    styles.qty,
                    item.quantity === 0 ? styles.zeroQty : (item.quantity < 5 ? styles.lowQty : styles.normalQty)
                ]}>
                    {item.quantity}
                </Text>
                <Text style={styles.unit}>{item.unit}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Inventario Actual</Text>
            </View>

            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Buscar producto..."
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholderTextColor="#999"
                />
            </View>

            <FlatList
                data={filteredProducts}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
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
        paddingBottom: 0,
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
    list: {
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    image: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
        backgroundColor: '#eee',
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        color: '#888',
        marginBottom: 4,
    },
    tapHint: {
        fontSize: 12,
        color: '#4ECDC4',
        fontStyle: 'italic',
    },
    qtyContainer: {
        alignItems: 'center',
        minWidth: 60,
    },
    qtyLabel: {
        fontSize: 12,
        color: '#999',
        marginBottom: 2,
    },
    qty: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    normalQty: {
        color: '#4ECDC4',
    },
    lowQty: {
        color: '#FF9F43',
    },
    zeroQty: {
        color: '#FF6B6B',
    },
    unit: {
        fontSize: 12,
        color: '#999',
    }
});

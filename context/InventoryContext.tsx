
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initialData } from '../data/initialData';

const InventoryContext = createContext(undefined);

export function InventoryProvider({ children }) {
    // Clear old data to force update structure (simple dev hack for this task)
    // In prod we would migrate data

    const [products, setProducts] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const storedProducts = await AsyncStorage.getItem('inventory_products_v2'); // New key to force data refresh
            if (storedProducts) {
                setProducts(JSON.parse(storedProducts));
            } else {
                setProducts(initialData.products);
            }
        } catch (e) {
            console.error("Failed to load data", e);
        } finally {
            setLoading(false);
        }
    };

    const updateProductQuantity = async (id, delta) => {
        const newProducts = products.map(p => {
            if (p.id === id) {
                const newQuantity = Math.max(0, p.quantity + delta);

                // Create history item
                const historyItem = {
                    timestamp: Date.now(),
                    type: delta > 0 ? 'restock' : 'usage',
                    amount: delta,
                    user: currentUser ? currentUser.name : 'Desconocido'
                };

                // Add to history and keep last 20 (increased history size)
                const newHistory = [historyItem, ...(p.history || [])].slice(0, 20);

                return {
                    ...p,
                    quantity: newQuantity,
                    history: newHistory
                };
            }
            return p;
        });

        setProducts(newProducts);
        await AsyncStorage.setItem('inventory_products_v2', JSON.stringify(newProducts));
    };

    const editProductQuantity = async (id, newQuantity) => {
        const newProducts = products.map(p => {
            if (p.id === id) {
                // Create history item for edit
                const historyItem = {
                    timestamp: Date.now(),
                    type: 'edit',
                    previous: p.quantity,
                    new: newQuantity,
                    user: currentUser ? currentUser.name : 'Desconocido'
                };

                const newHistory = [historyItem, ...(p.history || [])].slice(0, 20);

                return {
                    ...p,
                    quantity: parseInt(newQuantity), // Ensure number
                    history: newHistory
                };
            }
            return p;
        });

        setProducts(newProducts);
        await AsyncStorage.setItem('inventory_products_v2', JSON.stringify(newProducts));
    };

    const addNewProduct = async (product) => {
        const newProduct = {
            ...product,
            id: Date.now().toString(), // Simple ID generation
            history: []
        };
        const updatedProducts = [...products, newProduct];
        setProducts(updatedProducts);
        await AsyncStorage.setItem('inventory_products_v2', JSON.stringify(updatedProducts));
    };

    const login = (username, password) => {
        // In a real app, this would be an API call
        // For now we check against our local JSON
        const users = require('../data/users.json');
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            setCurrentUser(user);
            return user;
        }
        return null;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    return (
        <InventoryContext.Provider value={{
            products,
            currentUser,
            updateProductQuantity,
            editProductQuantity,
            addNewProduct,
            login,
            logout,
            loading
        }}>
            {children}
        </InventoryContext.Provider>
    );
}

export const useInventory = () => useContext(InventoryContext);

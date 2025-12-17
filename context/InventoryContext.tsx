
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../firebaseConfig';
import {
    collection,
    onSnapshot,
    doc,
    updateDoc,
    addDoc,
    writeBatch,
    where,
    query,
    getDocs
} from 'firebase/firestore';
import { initialData } from '../data/initialData';
import initialUsers from '../data/users.json';

// --- Interfaces ---
export interface HistoryItem {
    timestamp: number;
    type: string;
    amount?: number;
    previous?: number;
    new?: number;
    user?: string;
    changes?: string[];
}

export interface Product {
    id: string;
    name: string;
    description: string;
    quantity: number;
    unit: string;
    image: string;
    history: HistoryItem[];
    isActive?: boolean;
    [key: string]: any; // Allow dynamic access for updates
}

interface User {
    username: string;
    name: string;
    role: string;
    password?: string;
}

const InventoryContext = createContext<any>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // --- Helpers ---
    const createHistoryItem = (type: string, details: Partial<HistoryItem>): HistoryItem => ({
        timestamp: Date.now(),
        type,
        user: currentUser ? currentUser.name : 'Desconocido',
        ...details
    });

    const updateProductHistory = async (id: string, updates: Partial<Product>, newHistoryItem: HistoryItem) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const newHistory = [newHistoryItem, ...(product.history || [])].slice(0, 30); // Keep last 30 events

        try {
            await updateDoc(doc(db, 'products', id), {
                ...updates,
                history: newHistory
            });
        } catch (e) {
            console.error(`Error updating product ${id}:`, e);
            throw e; // Propagate error for UI handling
        }
    };

    useEffect(() => {
        // Real-time listener for Firestore
        const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
            const productsList: Product[] = [];
            snapshot.forEach((doc) => {
                productsList.push({ id: doc.id, ...doc.data() } as Product);
            });

            // If DB is empty, migrate initial data
            if (productsList.length === 0 && !loading) {
                seedDatabase();
            } else {
                setProducts(productsList);
            }
        }, (error) => {
            console.error("Error fetching products: ", error);
        });

        // Check for persistent login
        checkLoginStatus();

        // Ensure users exist
        seedUsersIfNeeded();

        return () => unsubscribe();
    }, []);

    const seedUsersIfNeeded = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            if (usersSnapshot.empty) {
                console.log("Seeding users...");
                const batch = writeBatch(db);
                initialUsers.forEach((user: any) => {
                    const userRef = doc(collection(db, 'users'));
                    batch.set(userRef, user);
                });
                await batch.commit();
                console.log("Users seeded successfully");
            }
        } catch (e) {
            console.error("Error seeding users:", e);
        }
    };

    const checkLoginStatus = async () => {
        try {
            const savedUser = await AsyncStorage.getItem('inventory_user_session');
            if (savedUser) {
                setCurrentUser(JSON.parse(savedUser));
            }
        } catch (e) {
            console.error("Error checking login session:", e);
        } finally {
            setLoading(false);
        }
    };

    const seedDatabase = async () => {
        try {
            console.log("Seeding database with initial data...");
            const batch = writeBatch(db);

            // Seed Products
            initialData.products.forEach((product: any) => {
                const docRef = doc(collection(db, 'products'));
                batch.set(docRef, {
                    ...product,
                    // Ensure ID is not part of the data field if we rely on doc.id, 
                    // but keeping it for consistency if needed, or better, let Firestore handle ID.
                    // We will remove 'id' from the data payload and let doc.id be the source of truth.
                    id: undefined,
                    history: []
                });
            });

            await batch.commit();
        } catch (e) {
            console.error("Error seeding database: ", e);
        }
    };

    // --- Actions ---

    const updateProductQuantity = async (id: string, delta: number) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const newQuantity = Math.max(0, product.quantity + delta);

        const historyItem = createHistoryItem(delta > 0 ? 'restock' : 'usage', {
            amount: delta,
            previous: product.quantity,
            new: newQuantity
        });

        await updateProductHistory(id, { quantity: newQuantity }, historyItem);
    };

    const editProductQuantity = async (id: string, newQuantityStr: string) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const newQuantity = parseInt(newQuantityStr);
        if (isNaN(newQuantity)) return;

        const historyItem = createHistoryItem('edit', {
            previous: product.quantity,
            new: newQuantity
        });

        await updateProductHistory(id, { quantity: newQuantity }, historyItem);
    };

    const updateProductDetails = async (id: string, updates: any) => {
        const product = products.find(p => p.id === id);
        if (!product) return;

        const { quantity, history, ...safeUpdates } = updates;
        const changedFields = Object.keys(safeUpdates).filter(key => safeUpdates[key] !== product[key]);

        if (changedFields.length > 0) {
            const historyItem = createHistoryItem('details_edit', {
                changes: changedFields
            });
            await updateProductHistory(id, safeUpdates, historyItem);
        } else {
            // Just update without history if no meaningful changes tracked? 
            // Or maybe we want to save anyway. For now, assume we only save if changes.
            // But if specific requirement to update anyway:
            try {
                await updateDoc(doc(db, 'products', id), safeUpdates);
            } catch (e) { console.error(e); throw e; }
        }
    };

    const deleteProduct = async (id: string) => {
        const historyItem = createHistoryItem('details_edit', {
            changes: ['Producto desactivado']
        });

        await updateProductHistory(id, { isActive: false }, historyItem);
    };

    const addNewProduct = async (product: any) => {
        try {
            const docRef = await addDoc(collection(db, 'products'), {
                ...product,
                history: []
            });
            return docRef.id;
        } catch (e) {
            console.error("Error adding product: ", e);
            throw e;
        }
    };

    const login = async (username: string, password: string) => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'users'),
                where("username", "==", username),
                where("password", "==", password)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data() as User;
                setCurrentUser(userData);
                await AsyncStorage.setItem('inventory_user_session', JSON.stringify(userData));
                setLoading(false);
                return userData;
            } else {
                setLoading(false);
                return null;
            }
        } catch (error) {
            console.error("Login error:", error);
            setLoading(false);
            return null;
        }
    };

    const logout = async () => {
        setCurrentUser(null);
        await AsyncStorage.removeItem('inventory_user_session');
    };

    return (
        <InventoryContext.Provider value={{
            products,
            currentUser,
            updateProductQuantity,
            editProductQuantity,
            updateProductDetails,
            addNewProduct,
            deleteProduct,
            login,
            logout,
            loading
        }}>
            {children}
        </InventoryContext.Provider>
    );
}

export const useInventory = () => useContext(InventoryContext);

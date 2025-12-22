
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
    getDocs,
    deleteDoc
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
    sessionId?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    quantity: number;
    unit: string;

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

export interface Announcement {
    id: string;
    message: string;
    isActive: boolean;
    timestamp: number;
}

const InventoryContext = createContext<any>(undefined);

export function InventoryProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
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

        const unsubscribeAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
            const list: Announcement[] = [];
            snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() } as Announcement);
            });
            // Sort by timestamp desc
            list.sort((a, b) => b.timestamp - a.timestamp);
            setAnnouncements(list);
        }, (error) => {
            console.error("Error fetching announcements: ", error);
        });

        // Check for persistent login
        checkLoginStatus();

        // Ensure users exist
        seedUsersIfNeeded();

        return () => {
            unsubscribe();
            unsubscribeAnnouncements();
        };
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
                // Destructure to omit 'image' if it exists in initialData.products
                const { image, ...productWithoutImage } = product;
                batch.set(docRef, {
                    ...productWithoutImage,
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

    const updateProductQuantity = async (id: string, delta: number, sessionId?: string) => {
        const product = products.find(p => p.id === id);
        if (!product) {
            console.error(`Product with id ${id} not found in current state.`);
            throw new Error("Producto no encontrado. Intenta recargar.");
        }

        const currentQty = Number(product.quantity || 0);
        const changeAmount = Number(delta);
        const newQuantity = Math.max(0, currentQty + changeAmount);

        // Debug log
        console.log(`Updating product ${product.name}: ${currentQty} -> ${newQuantity} (Delta: ${changeAmount})`);

        const historyItem = createHistoryItem(changeAmount > 0 ? 'restock' : 'usage', {
            amount: changeAmount,
            previous: currentQty,
            new: newQuantity,
            sessionId
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

        // Destructure to omit 'image' from updates if it's passed
        const { quantity, history, image, ...safeUpdates } = updates;
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

    const restoreProduct = async (id: string) => {
        const historyItem = createHistoryItem('details_edit', {
            changes: ['Producto restaurado']
        });

        await updateProductHistory(id, { isActive: true }, historyItem);
    };

    const permanentDeleteProduct = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'products', id));
        } catch (e) {
            console.error("Error deleting product permanently: ", e);
            throw e;
        }
    };

    const restoreDatabase = async (backupData: Product[]) => {
        try {
            console.log("Iniciando restauración de base de datos...");
            setLoading(true);

            // 1. Obtener todos los productos actuales
            const snapshot = await getDocs(collection(db, 'products'));

            // 2. Eliminar todos los productos actuales en lotes
            const deleteBatchLimit = 400; // Margen de seguridad
            const deleteChunks = [];
            let currentDeleteBatch = writeBatch(db);
            let deleteCounter = 0;

            snapshot.docs.forEach((doc) => {
                currentDeleteBatch.delete(doc.ref);
                deleteCounter++;
                if (deleteCounter >= deleteBatchLimit) {
                    deleteChunks.push(currentDeleteBatch.commit());
                    currentDeleteBatch = writeBatch(db);
                    deleteCounter = 0;
                }
            });
            if (deleteCounter > 0) deleteChunks.push(currentDeleteBatch.commit());

            await Promise.all(deleteChunks);
            console.log("Base de datos limpia.");

            // 3. Insertar datos del respaldo
            const addChunks = [];
            let currentAddBatch = writeBatch(db);
            let addCounter = 0;

            backupData.forEach((product) => {
                const docRef = doc(collection(db, 'products')); // Generar nuevo ID o usar el del producto si se quisiera preservar
                // En este caso, si el producto tiene ID en el JSON, lo ignoramos y dejamos que Firestore cree uno nuevo, O
                // si queremos preservar IDs exactos para integridad histórica estricta, usaríamos set(doc(db, 'products', product.id), ...)
                // Dado que es un "Restore", preservar IDs parece lo correcto.

                // Opción: Si el JSON tiene ID, usarlo. Si no, generar uno.
                const targetRef = product.id ? doc(db, 'products', product.id) : docRef;

                // Limpiar el objeto antes de guardar (quitar ID si está dentro de data, aunque set lo sobrescribe)
                const { id, ...dataToSave } = product;

                currentAddBatch.set(targetRef, dataToSave);

                addCounter++;
                if (addCounter >= deleteBatchLimit) {
                    addChunks.push(currentAddBatch.commit());
                    currentAddBatch = writeBatch(db);
                    addCounter = 0;
                }
            });

            if (addCounter > 0) addChunks.push(currentAddBatch.commit());
            await Promise.all(addChunks);

            console.log("Restauración completada.");
        } catch (e) {
            console.error("Error al restaurar base de datos:", e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    // --- Announcement Actions ---
    const addAnnouncement = async (message: string) => {
        try {
            await addDoc(collection(db, 'announcements'), {
                message,
                isActive: true,
                timestamp: Date.now()
            });
        } catch (e) {
            console.error("Error adding announcement:", e);
            throw e;
        }
    };

    const updateAnnouncement = async (id: string, updates: Partial<Announcement>) => {
        try {
            await updateDoc(doc(db, 'announcements', id), updates);
        } catch (e) {
            console.error("Error updating announcement:", e);
            throw e;
        }
    };

    const deleteAnnouncement = async (id: string) => {
        try {
            await deleteDoc(doc(db, 'announcements', id));
        } catch (e) {
            console.error("Error deleting announcement:", e);
            throw e;
        }
    };



    const saveJobLog = async (jobData: any) => {
        try {
            await addDoc(collection(db, 'jobs'), {
                ...jobData,
                timestamp: Date.now()
            });
        } catch (e) {
            console.error("Error saving job log:", e);
        }
    };

    const getLastJob = async () => {
        try {
            const q = query(collection(db, 'jobs'), where("timestamp", ">", 0));
            // Better: Order by timestamp desc limit 1. Requires index possibly.
            // Simplified: Fetch all (assuming low volume of jobs) and sort locally or try simple orderBy if no index required for small collection.
            // Firestore requires index for simple sorting sometimes? No, single field sort is auto indexed.
            // But we need to use orderBy("timestamp", "desc").
            // Let's assume user has no index yet, so maybe just get recent jobs.
            // Actually, for singular query `orderBy` works fine by default.

            // To avoid complex query issues without index creation response from CLI, I'll fetch recent.
            // But let's try proper way.

            // For now, simpler: user wants "el ultimo".
            const jobsSnapshot = await getDocs(collection(db, 'jobs'));
            const jobs = jobsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            jobs.sort((a: any, b: any) => b.timestamp - a.timestamp);
            return jobs.length > 0 ? jobs[0] : null;
        } catch (e) {
            console.error("Error fetching last job:", e);
            return null;
        }
    };

    const rollbackJob = async (job: any) => {
        try {
            setLoading(true);
            const { sessionId, details } = job;
            // details is array of { productId, amountChanged, ... }
            // Actually, we rely on the history items if we can find them, OR we rely on the job log details to revert numbers.
            // Reverting numbers is safer from Job Log if we save deltas there.

            // 1. Revert Quantities
            const batch = writeBatch(db);

            // We need to fetch current products first to get their history
            // Actually we have `products` in state but better to be transactional?
            // Mixing state and batch is tricky. Let's do async ops.

            for (const detail of (details || [])) {
                const productRef = doc(db, 'products', detail.productId);
                // We need to read it to update history array specifically (remove the item)
                // Firestore transaction would be best but let's do simple read-modify-write per product or batch update if we just add "Rollback" history which is safer than deleting history.
                // User asked: "eliminando tambien los registros realizados". So we must delete history items.

                // Get fresh doc
                const pDoc = await import('firebase/firestore').then(mod => mod.getDoc(productRef));
                if (pDoc.exists()) {
                    const pData = pDoc.data() as Product;
                    const newHistory = (pData.history || []).filter(h => h.sessionId !== sessionId);

                    // Revert quantity: if we added 5, we subtract 5.
                    // The detail should store the delta 'amount'.
                    const reverseDetails = detail.changes || [];
                    // Wait, let's define ensure we save meaningful details in saveJobLog.
                    // Assuming detail has { productId, delta }.
                    const currentQty = Number(pData.quantity || 0);
                    const newQty = currentQty - (detail.delta || 0);

                    batch.update(productRef, {
                        quantity: newQty < 0 ? 0 : newQty,
                        history: newHistory
                    });
                }
            }

            // 2. Delete Job Record
            const jobRef = doc(db, 'jobs', job.id);
            batch.delete(jobRef);

            await batch.commit();
            console.log("Rollback completed.");
        } catch (e) {
            console.error("Error rolling back job:", e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const addNewProduct = async (product: any) => {
        try {
            // Destructure to omit 'image' if it exists in the product object being added
            const { image, ...productWithoutImage } = product;

            // Ensure quantity is a number
            const initialQuantity = typeof productWithoutImage.quantity === 'string'
                ? parseInt(productWithoutImage.quantity)
                : productWithoutImage.quantity;

            // Create initial history entry using helper for consistency
            const initialHistoryItem = createHistoryItem('restock', {
                amount: initialQuantity,
                previous: 0,
                new: initialQuantity,
                sessionId: `initial_${Date.now()}`
            });

            const docRef = await addDoc(collection(db, 'products'), {
                ...productWithoutImage,
                quantity: initialQuantity,
                history: [initialHistoryItem]
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

    const loginAsGuest = async () => {
        setLoading(true);
        const guestUser: User = {
            username: 'encargado',
            name: 'Encargado',
            role: 'user'
        };
        setCurrentUser(guestUser);
        await AsyncStorage.setItem('inventory_user_session', JSON.stringify(guestUser));
        setLoading(false);
        return guestUser;
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
            restoreProduct,
            permanentDeleteProduct,
            restoreDatabase,
            login,
            loginAsGuest,
            logout,
            loading,
            saveJobLog,
            getLastJob,
            rollbackJob,
            announcements,
            addAnnouncement,
            updateAnnouncement,
            deleteAnnouncement
        }}>
            {children}
        </InventoryContext.Provider>
    );
}

export const useInventory = () => useContext(InventoryContext);

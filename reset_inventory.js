
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, updateDoc, deleteDoc, doc, writeBatch } = require("firebase/firestore");
const dotenv = require('dotenv');

// Cargar variables de entorno desde .env
dotenv.config();

// Configuración de Firebase
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log("Conectando a Firebase con Project ID:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetInventory() {
    try {
        console.log("⚠️  Iniciando REINICIO TOTAL DE INVENTARIO...");

        const batchSize = 400;

        // 1. Resetear Productos (Cantidad a 0 y Historial Vacío)
        console.log("📦 Reseteando productos...");
        const productsCollection = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCollection);

        if (!productsSnapshot.empty) {
            let batch = writeBatch(db);
            let count = 0;
            let totalProcessed = 0;

            for (const d of productsSnapshot.docs) {
                const productRef = doc(db, 'products', d.id);
                // Reset Quantity to 0 and History to []
                batch.update(productRef, {
                    quantity: 0,
                    history: []
                });

                count++;
                if (count >= batchSize) {
                    await batch.commit();
                    batch = writeBatch(db);
                    totalProcessed += count;
                    console.log(`   - ${totalProcessed} productos actualizados...`);
                    count = 0;
                }
            }

            if (count > 0) {
                await batch.commit();
                totalProcessed += count;
            }
            console.log(`✅ ${totalProcessed} productos reseteados a 0.`);
        } else {
            console.log("ℹ️  No hay productos para resetear.");
        }

        // 2. Eliminar Trabajos/Logs (Limpiar transacciones)
        console.log("🧹 Eliminando registro de trabajos (jobs)...");
        const jobsCollection = collection(db, 'jobs');
        const jobsSnapshot = await getDocs(jobsCollection);

        if (!jobsSnapshot.empty) {
            let batch = writeBatch(db);
            let count = 0;
            let totalDeleted = 0;

            for (const d of jobsSnapshot.docs) {
                batch.delete(d.ref);
                count++;
                if (count >= batchSize) {
                    await batch.commit();
                    batch = writeBatch(db);
                    totalDeleted += count;
                    console.log(`   - ${totalDeleted} trabajos eliminados...`);
                    count = 0;
                }
            }

            if (count > 0) {
                await batch.commit();
                totalDeleted += count;
            }
            console.log(`✅ ${totalDeleted} trabajos eliminados.`);
        } else {
            console.log("ℹ️  No hay registros de trabajos para eliminar.");
        }

        console.log("\n🎉 REINICIO COMPLETO EXITOSAMENTE.\n   Todo el inventario está en 0 y el historial limpio.");
    } catch (error) {
        console.error("❌ Error durante el reinicio:", error);
    }
}

resetInventory();

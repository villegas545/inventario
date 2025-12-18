
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, addDoc, deleteDoc } = require("firebase/firestore");
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

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

const PRODUCTS_FILE_PATH = path.join(__dirname, 'data', 'products_seed.json');

async function seedProducts() {
    try {
        if (!fs.existsSync(PRODUCTS_FILE_PATH)) {
            console.error(`❌ Error: No se encontró el archivo ${PRODUCTS_FILE_PATH}`);
            process.exit(1);
        }

        const data = fs.readFileSync(PRODUCTS_FILE_PATH, 'utf8');
        const productsToSeed = JSON.parse(data);

        console.log(`📦 Procesando ${productsToSeed.length} productos...`);
        const productsCollection = collection(db, 'products');

        // PASO 1: Eliminar productos existentes
        console.log("🔥 Eliminando productos existentes...");
        const snapshot = await getDocs(productsCollection);

        if (!snapshot.empty) {
            console.log(`Encontrados ${snapshot.size} productos para eliminar...`);
            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);
            console.log(`🗑️  Todos los productos antiguos eliminados.`);
        } else {
            console.log("ℹ️  La base de datos ya estaba vacía.");
        }

        // PASO 2: Agregar nuevos productos
        console.log("🌱 Agregando nuevos productos...");
        for (const product of productsToSeed) {
            const newProduct = {
                name: product.name,
                description: product.description || "",
                quantity: product.quantity || 0,
                unit: product.unit || "pz",
                isActive: true,
                history: [],
                ...product
            };

            // Eliminar propiedad id si existe para que Firestore genere uno nuevo
            if (newProduct.id) delete newProduct.id;

            await addDoc(productsCollection, newProduct);
            console.log(`✅ Agregado: "${product.name}"`);
        }

        console.log("\n🎉 Proceso de seeding terminado EXITOSAMENTE.");
    } catch (error) {
        console.error("❌ Error CRÍTICO durante el seeding:", error);
    }
}

seedProducts();

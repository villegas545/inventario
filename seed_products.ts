
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, query, where, doc, setDoc } from "firebase/firestore";
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno desde .env
dotenv.config();

// Configuración de Firebase (usando las variables cargadas)
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

// Ruta al archivo JSON con los productos
const PRODUCTS_FILE_PATH = path.join(__dirname, 'data', 'products_seed.json');

async function seedProducts() {
    try {
        if (!fs.existsSync(PRODUCTS_FILE_PATH)) {
            console.error(`❌ Error: No se encontró el archivo ${PRODUCTS_FILE_PATH}`);
            console.log("ℹ️  Por favor crea el archivo 'data/products_seed.json' con el array de productos.");
            process.exit(1);
        }

        const data = fs.readFileSync(PRODUCTS_FILE_PATH, 'utf8');
        const productsToSeed = JSON.parse(data);

        if (!Array.isArray(productsToSeed)) {
            console.error("❌ Error: El archivo JSON debe contener un array de productos.");
            process.exit(1);
        }

        console.log(`📦 Procesando ${productsToSeed.length} productos...`);

        const productsCollection = collection(db, 'products');

        for (const product of productsToSeed) {
            // Verificar si el producto ya existe por nombre (puedes cambiar esto por otro campo único)
            const q = query(productsCollection, where("name", "==", product.name));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                console.log(`⚠️  Saltando: "${product.name}" ya existe.`);
            } else {
                // Preparar datos del producto
                const newProduct = {
                    name: product.name,
                    description: product.description || "",
                    quantity: product.quantity || 0,
                    unit: product.unit || "pz",
                    isActive: true, // Por defecto activo
                    history: [],    // Historial vacío inicial
                    // Agregar cualquier otro campo que venga en el JSON
                    ...product
                };

                // Eliminar campos que no queremos guardar directamente si es necesario (ej. id si viene en el json)
                delete (newProduct as any).id;

                await addDoc(productsCollection, newProduct);
                console.log(`✅ Agregado: "${product.name}"`);
            }
        }

        console.log("\n🎉 Proceso de seeding terminado.");
    } catch (error) {
        console.error("❌ Error durante el seeding:", error);
    }
}

seedProducts();

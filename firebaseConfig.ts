import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics"; // Analytics not strictly needed for React Native in this context/often requires specific setup

const firebaseConfig = {
    apiKey: "AIzaSyBH8X47wmsSxSNkeNAGJHrQVlXrUI979l0",
    authDomain: "inventario-7572b.firebaseapp.com",
    projectId: "inventario-7572b",
    storageBucket: "inventario-7572b.firebasestorage.app",
    messagingSenderId: "283814697452",
    appId: "1:283814697452:web:cd79fbddeb3d54ac9088c9",
    measurementId: "G-XW659BJ366"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

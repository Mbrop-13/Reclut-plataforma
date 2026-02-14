import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getFunctions, Functions, connectFunctionsEmulator } from "firebase/functions";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCudeTXQu6Ht9r3J4fc_EP6r1QRDyE8yo4",
    authDomain: "recru-335a5.firebaseapp.com",
    projectId: "recru-335a5",
    storageBucket: "recru-335a5.firebasestorage.app",
    messagingSenderId: "1067441914094",
    appId: "1:1067441914094:web:ce6997eaac7bd1be2bb3ff",
    measurementId: "G-1S1KKQ5N84"
};

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;
let analytics: Analytics;
let functions: Functions;

try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    functions = getFunctions(app); // Default region is us-central1

    // Optional: Connect to emulator if in dev mode
    // if (process.env.NODE_ENV === 'development') {
    //    connectFunctionsEmulator(functions, "localhost", 5001);
    // }

    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

// Analytics (only on client side)
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported && app) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, db, auth, storage, analytics, functions };

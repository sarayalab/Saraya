import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA0h7K-a4aSoc_lLJnsIW3_yjtmHLnp68M",
  authDomain: "saraya-app.firebaseapp.com",
  projectId: "saraya-app",
  storageBucket: "saraya-app.firebasestorage.app",
  messagingSenderId: "826074449604",
  appId: "1:826074449604:web:d6b6b228a26d94a3d72b91",
  measurementId: "G-E4TGBD8WHN",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Firestore
const db = getFirestore(app);
export const storage = getStorage(app);

export { auth, db };

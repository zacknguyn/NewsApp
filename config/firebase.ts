import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  Auth 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants for Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCp6sJzESlyVWSoYEjQ1k3ETR8INlkNsuE",
  authDomain: "news-app-8dfda.firebaseapp.com",
  projectId: "news-app-8dfda",
  storageBucket: "news-app-8dfda.firebasestorage.app",
  messagingSenderId: "554710787770",
  appId: "1:554710787770:web:dbe2a2691e9a135b290483",
  measurementId: "G-E2ZV4LXWYE",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth with persistence for React Native
let auth: Auth;
try {
  // Use require to avoid build-time issues with React Native specific exports
  const { getReactNativePersistence } = require("firebase/auth");
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (e) {
  // Fallback to default auth (memory persistence for native, or default for web)
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { app, auth, db };

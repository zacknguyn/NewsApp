import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth,
  Auth
} from "firebase/auth";
import * as FirebaseAuth from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyCp6sJzESlyVWSoYEjQ1k3ETR8INlkNsuE",
  authDomain: "news-app-8dfda.firebaseapp.com",
  projectId: "news-app-8dfda",
  storageBucket: "news-app-8dfda.firebasestorage.app",
  messagingSenderId: "554710787770",
  appId: "1:554710787770:web:dbe2a2691e9a135b290483",
  measurementId: "G-E2ZV4LXWYE",
};

// Singleton initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;

if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  // Use property access to bypass the missing export lint
  const getReactNativePersistence = (FirebaseAuth as any).getReactNativePersistence;
  
  try {
    // If it's already initialized, initializeAuth will throw
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    console.log("Firebase Auth initialized with persistence.");
  } catch (e) {
    auth = getAuth(app);
    console.log("Firebase Auth was already initialized.");
  }
}

const db = getFirestore(app);

export { app, auth, db };

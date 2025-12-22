import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCp6sJzESlyVWSoYEjQ1k3ETR8INlkNsuE",
  authDomain: "news-app-8dfda.firebaseapp.com",
  projectId: "news-app-8dfda",
  storageBucket: "news-app-8dfda.firebasestorage.app",
  messagingSenderId: "554710787770",
  appId: "1:554710787770:web:dbe2a2691e9a135b290483",
  measurementId: "G-E2ZV4LXWYE",
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { app, auth, db };

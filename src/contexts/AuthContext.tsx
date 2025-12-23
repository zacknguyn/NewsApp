// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { View, Platform } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { User } from "../types";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Google Sign-In configuration
  const [request, response, promptAsync] = Google.useAuthRequest({
    // For Expo Go: Use the Web Client ID for all platforms. 
    // For production: Use specific IDs for each platform.
    iosClientId: "554710787770-8ro3t6fjhnc9lbbeibc8udn98tpvkvda.apps.googleusercontent.com",
    androidClientId: "554710787770-8ro3t6fjhnc9lbbeibc8udn98tpvkvda.apps.googleusercontent.com",
    webClientId: "554710787770-8ro3t6fjhnc9lbbeibc8udn98tpvkvda.apps.googleusercontent.com",
  });

  // Handle Google Sign-In response
  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      if (authentication?.idToken) {
        const credential = GoogleAuthProvider.credential(
          authentication.idToken
        );
        signInWithCredential(auth, credential);
      }
    }
  }, [response]);

  // Listen to auth state changes
  useEffect(() => {
    // Safety timeout for web to prevent infinite loading
    const timeout = Platform.OS === 'web' ? setTimeout(() => setLoading(false), 3000) : null;
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (timeout) clearTimeout(timeout);
      
      // Clean up previous doc listener if it exists
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        // Set up real-time listener for user document
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        unsubscribeDoc = onSnapshot(userDocRef, async (snapshot) => {
          if (snapshot.exists()) {
            setUser(snapshot.data() as User);
          } else {
            // Create user document if it doesn't exist (e.g. first time login)
            const newUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || "",
              name: firebaseUser.displayName || "User",
              role: "user",
              favoriteTopics: [],
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newUser);
            // The snapshot listener will fire again once the document is created
          }
          setLoading(false);
        }, (error) => {
          console.error("Error listening to user doc:", error);
          setLoading(false);
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser: User = {
        id: userCredential.user.uid,
        email,
        name,
        role: "user",
        favoriteTopics: [],
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", userCredential.user.uid), newUser);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await promptAsync();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, ...updates };
      await setDoc(doc(db, "users", user.id), updatedUser);
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

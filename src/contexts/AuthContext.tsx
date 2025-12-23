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
import { makeRedirectUri } from "expo-auth-session";

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
    scopes: ["openid", "profile", "email"],
    // Force id_token response for Firebase compatibility
    responseType: "id_token",
    // Hardcode the native redirect URI to v9 to prevent fallback to exp://
    redirectUri: Platform.OS === 'web' 
      ? makeRedirectUri() 
      : 'https://auth.expo.io/@zacknguyn/NewsApp',
  });

  // Log the redirect URI to help with debugging
  useEffect(() => {
    if (request) {
      console.log("-----------------------------------------");
      console.log("AUTH CONFIG v11:"); 
      console.log("Platform:", Platform.OS);
      console.log("Redirect URI:", request.redirectUri);
      console.log("Response Type:", request.responseType);
      console.log("-----------------------------------------");
    }
  }, [request]);

  // Handle Google Sign-In response
  useEffect(() => {
    console.log("Auth Response Type:", response?.type);
    if (response?.type === "success") {
      const { authentication, params } = response;
      console.log("Full Auth Response Params:", params);
      
      // On some platforms, the idToken might be in authentication or in params
      const idToken = authentication?.idToken || params?.id_token;
      
      console.log("Auth successful, tokens received:", {
        idToken: idToken ? "YES" : "NO",
        accessToken: authentication?.accessToken ? "YES" : "NO",
      });

      if (idToken) {
        const credential = GoogleAuthProvider.credential(idToken);
        signInWithCredential(auth, credential).catch(err => {
          console.error("Firebase Sign-In Error:", err);
        });
      } else {
        console.warn("No idToken found in response. Google Sign-In with Firebase requires idToken.");
      }
    } else if (response?.type === "error") {
      console.error("Google Auth Response Error:", response.error);
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
      console.log("Starting Google Login (v11)...");
      
      const result = await promptAsync({ 
        //@ts-ignore
        useProxy: Platform.OS !== 'web',
        scheme: "newsapp",
      });
      
      console.log("Prompt Result (v11):", result.type);
      if (result.type === "success") {
        console.log("Success Result Keys:", Object.keys(result));
      } else if (result.type === "error") {
        console.error("Auth Session Detailed Error:", result.error);
        console.error("Full Result:", JSON.stringify(result));
      }
    } catch (error: any) {
      console.error("loginWithGoogle Exception (v11):", error);
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

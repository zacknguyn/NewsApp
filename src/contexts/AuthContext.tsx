// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { User } from "../types";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Use different redirect URIs for web vs mobile
  const redirectUri =
    Platform.OS === "web"
      ? undefined // Let expo-auth-session handle it for web
      : "https://auth.expo.io/@zacknguyn/NewsApp"; // Use Expo proxy for mobile

  console.log("🔗 Platform:", Platform.OS);
  console.log("🔗 Configured Redirect URI:", redirectUri || "auto");

  // Google Auth Configuration
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "554710787770-8ro3t6fjhnc9lbbeibc8udn98tpvkvda.apps.googleusercontent.com",
    redirectUri: redirectUri,
  });

  // Handle Google OAuth Response
  useEffect(() => {
    if (!response) return;

    const handleGoogleResponse = async () => {
      try {
        console.log("📱 Google Auth Response:", response.type);

        if (response.type === "success") {
          const { id_token, authentication } = response.params;

          // Try to get the token from different possible locations
          const token = id_token || response.authentication?.idToken;

          if (!token) {
            console.error("❌ No ID token in response");
            alert("Authentication failed: No ID token received from Google");
            return;
          }

          console.log("🔐 Token received, signing in to Firebase...");

          try {
            // Create Firebase credential and sign in
            const credential = GoogleAuthProvider.credential(token);
            const result = await signInWithCredential(auth, credential);

            console.log("✅ Successfully signed in:", result.user.email);
          } catch (firebaseError: any) {
            console.error("❌ Firebase error:", firebaseError);
            alert(
              `Firebase sign-in failed!\nError: ${firebaseError.code}\n${firebaseError.message}`
            );
            throw firebaseError;
          }
        } else if (response.type === "error") {
          console.error("❌ OAuth Error:", response.error);
          alert(
            `Google sign-in failed: ${response.error?.message || "Unknown error"}`
          );
        }
      } catch (error: any) {
        console.error("❌ Error during sign-in:", error);

        if (error.code === "auth/invalid-credential") {
          alert(
            "Invalid Google credentials. Please verify Firebase Console settings."
          );
        } else if (error.code === "auth/operation-not-allowed") {
          alert("Google sign-in is not enabled in Firebase Console.");
        } else if (!error.code || error.code.indexOf("auth/") !== 0) {
          alert(`Sign-in error: ${error.message || "Unknown error"}`);
        }
      }
    };

    handleGoogleResponse();
  }, [response]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ ...userDoc.data(), id: firebaseUser.uid } as User);
        } else {
          const newUser: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "User",
            role: "user",
            favoriteTopics: [],
            savedArticles: [],
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      console.log("🚀 Initiating Google Sign-In...");

      if (!request) {
        throw new Error(
          "Google authentication is not ready. Please try again in a moment."
        );
      }

      console.log("📝 Request config:", {
        clientId: request.clientId,
        redirectUri: request.redirectUri,
      });

      // Trigger the Google sign-in prompt
      await promptAsync();

      console.log("✅ Prompt completed");
    } catch (error: any) {
      console.error("❌ Google login error:", error);
      throw new Error(error.message || "Failed to initiate Google sign-in");
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser: User = {
        id: firebaseUser.uid,
        email,
        name,
        role: "user",
        favoriteTopics: [],
        savedArticles: [],
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      setUser(newUser);
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
      await setDoc(doc(db, "users", user.id), { ...user, ...updates });
      setUser({ ...user, ...updates });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string
  ) => {
    try {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser || !firebaseUser.email) {
        throw new Error("No user is currently signed in");
      }

      // Check if user signed in with Google
      const isGoogleUser = firebaseUser.providerData.some(
        (provider) => provider.providerId === "google.com"
      );

      if (isGoogleUser) {
        throw new Error(
          "Cannot change password for Google accounts. Please use Google to manage your password."
        );
      }

      // Re-authenticate user before changing password (Firebase requirement)
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(firebaseUser, credential);

      // Update password
      await updatePassword(firebaseUser, newPassword);

      console.log("✅ Password updated successfully");
    } catch (error: any) {
      console.error("❌ Change password error code:", error.code);

      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        throw new Error("Mật khẩu hiện tại không đúng");
      } else if (error.code === "auth/weak-password") {
        throw new Error("Mật khẩu mới quá yếu. Sử dụng ít nhất 6 ký tự");
      } else if (error.code === "auth/requires-recent-login") {
        throw new Error(
          "Vui lòng đăng xuất và đăng nhập lại trước khi đổi mật khẩu"
        );
      } else {
        throw new Error(error.message || "Không thể đổi mật khẩu");
      }
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
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

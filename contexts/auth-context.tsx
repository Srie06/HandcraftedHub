"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import {
  signUp as firebaseSignUp,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
} from "@/lib/firebase/auth";
import {
  createDocument,
  getDocument,
  subscribeToDocument,
} from "@/lib/firebase/firestore";
import { AuthContextType, UserProfile } from "@/types";

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider component that wraps the app and provides authentication state
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to Firebase Auth state changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // User is signed in, fetch their profile from Firestore
        try {
          const profile = await getDocument("users", firebaseUser.uid);
          if (profile) {
            setUserProfile(profile as UserProfile);
          } else {
            // Profile doesn't exist, clear it
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        // User is signed out, clear profile
        setUserProfile(null);
      }

      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribeAuth();
  }, []);

  /**
   * Sign up a new user with email, password, role, and display name
   * Creates both Firebase Auth account and Firestore user profile
   */
  const signUp = async (
    email: string,
    password: string,
    role: "buyer" | "seller",
    displayName: string,
    sellerProfile?: {
      shopName: string;
      shopDescription: string;
      location: string;
      phone: string;
    }
  ): Promise<void> => {
    try {
      // Create Firebase Auth account
      const userCredential = await firebaseSignUp(email, password);
      const newUser = userCredential.user;

      // Create user profile in Firestore
      const userProfileData: Omit<UserProfile, "createdAt"> = {
        uid: newUser.uid,
        email: newUser.email!,
        displayName,
        role,
        profileComplete: role === "buyer" ? true : !!sellerProfile,
        ...(sellerProfile && {
          shopName: sellerProfile.shopName,
          shopDescription: sellerProfile.shopDescription,
          location: sellerProfile.location,
          phone: sellerProfile.phone,
        }),
      };

      await createDocument("users", userProfileData, newUser.uid);

      // Fetch the newly created profile
      const profile = await getDocument("users", newUser.uid);
      if (profile) {
        setUserProfile(profile as UserProfile);
      }
    } catch (error: any) {
      console.error("Error in signUp:", error);
      throw error;
    }
  };

  /**
   * Update user profile in Firestore
   */
  const updateUserProfile = async (
    data: Partial<UserProfile>
  ): Promise<void> => {
    try {
      if (!user) {
        throw new Error("No user logged in");
      }

      // Import updateDocument from firestore
      const { updateDocument } = await import("@/lib/firebase/firestore");
      await updateDocument("users", user.uid, data);

      // Update local state
      setUserProfile((prev) => (prev ? { ...prev, ...data } : null));
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  };

  /**
   * Sign in an existing user with email and password
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      await firebaseSignIn(email, password);
      // Auth state listener will handle fetching the profile
    } catch (error: any) {
      console.error("Error in signIn:", error);
      throw error;
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut();
      // Auth state listener will handle clearing the state
    } catch (error: any) {
      console.error("Error in signOut:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access the Auth context
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

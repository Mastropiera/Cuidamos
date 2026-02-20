"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  User,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AppUser, EmailMapping, Member } from "@/lib/types";

interface AuthContextProps {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshAppUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

async function resolveAppUser(firebaseUser: User): Promise<AppUser> {
  const base: AppUser = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || null,
    orgId: null,
    memberId: null,
    role: null,
    memberColor: null,
  };

  if (!db || !firebaseUser.email) return base;

  const emailKey = firebaseUser.email.toLowerCase().trim();

  try {
    const mappingSnap = await getDoc(doc(db, "emailMappings", emailKey));
    if (!mappingSnap.exists()) return base;

    const mapping = mappingSnap.data() as EmailMapping;

    // Load member to get color and check if uid needs binding
    const memberSnap = await getDoc(
      doc(db, "organizations", mapping.orgId, "members", mapping.memberId)
    );

    let memberColor: string | null = null;

    if (memberSnap.exists()) {
      const member = memberSnap.data() as Member;
      memberColor = member.color || null;

      // Bind UID on first login
      if (!member.uid) {
        await updateDoc(
          doc(db, "organizations", mapping.orgId, "members", mapping.memberId),
          { uid: firebaseUser.uid, updatedAt: new Date().toISOString() }
        );
      }
    }

    return {
      ...base,
      orgId: mapping.orgId,
      memberId: mapping.memberId,
      role: mapping.role,
      memberColor,
    };
  } catch (error) {
    console.error("Error resolving app user:", error);
    return base;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const resolved = await resolveAppUser(firebaseUser);
        setAppUser(resolved);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshAppUser = useCallback(async () => {
    if (user) {
      const resolved = await resolveAppUser(user);
      setAppUser(resolved);
    }
  }, [user]);

  const loginWithGoogle = async () => {
    if (!auth) {
      throw new Error("Firebase Auth no esta configurado. Revisa las variables de entorno NEXT_PUBLIC_FIREBASE_*");
    }

    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      const resolved = await resolveAppUser(result.user);
      setAppUser(resolved);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (
        firebaseError.code === "auth/popup-closed-by-user" ||
        firebaseError.code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setAppUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        appUser,
        loading,
        loginWithGoogle,
        logout,
        refreshAppUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

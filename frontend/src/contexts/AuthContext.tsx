import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../services/firebase";
import type { FirestoreUserDoc, UserProfile } from "../types";
import { getRandomAvatarColor } from "../utils/color";
import { userProfileFromDoc } from "../utils/firestore";

type AuthContextValue = {
  user: UserProfile | null;
  isLoading: boolean;
  register: (name: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUserId, setFirebaseUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsMounted(true);
      setFirebaseUserId(firebaseUser?.uid ?? null);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }
    if (!firebaseUserId) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const userDocRef = doc(db, "users", firebaseUserId);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        const data = snapshot.data() as FirestoreUserDoc | undefined;
        if (data) {
          setUser(userProfileFromDoc(snapshot.id, data));
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to user doc", error);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, [firebaseUserId, isMounted]);

  const register = useCallback(async (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error("名前を入力してください。");
    }

    const credential = await signInAnonymously(auth);
    const { user: firebaseUser } = credential;

    await updateProfile(firebaseUser, { displayName: trimmedName });

    const userDocRef = doc(db, "users", firebaseUser.uid);
    const userDoc: FirestoreUserDoc = {
      name: trimmedName,
      avatarColor: getRandomAvatarColor(),
      points: 0,
      photoUrl: null,
      activeCall: null,
      createdAt: Date.now(),
    };

    await setDoc(
      userDocRef,
      {
        ...userDoc,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      register,
      logout,
    }),
    [user, isLoading, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};

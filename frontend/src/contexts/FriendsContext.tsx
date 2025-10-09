import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Unsubscribe, collection, doc, onSnapshot } from "firebase/firestore";

import type { FirestoreFriendDoc, FirestoreUserDoc, FriendProfile } from "../types";
import { db } from "../services/firebase";
import { useAuth } from "./AuthContext";
import { userProfileFromDoc } from "../utils/firestore";
import { functionsBaseUrl, hasValidFunctionsBaseUrl } from "../config/env";

type FriendsContextValue = {
  friends: FriendProfile[];
  isLoading: boolean;
  addFriendById: (friendId: string) => Promise<void>;
};

const FriendsContext = createContext<FriendsContextValue | undefined>(undefined);

export const FriendsProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [friendMeta, setFriendMeta] = useState<
    Record<string, { roomId?: string; waiting?: boolean }>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFriends([]);
      setFriendIds([]);
      setFriendMeta({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const friendsRef = collection(db, "users", user.id, "friends");
    const unsubscribe = onSnapshot(
      friendsRef,
      (snapshot) => {
        const ids: string[] = [];
        const meta: Record<string, { roomId?: string; waiting?: boolean }> = {};

        snapshot.docs.forEach((docSnapshot) => {
          const data = docSnapshot.data() as FirestoreFriendDoc | undefined;
          const candidateId = docSnapshot.id || data?.friendId || "";
          if (!candidateId) {
            return;
          }
          ids.push(candidateId);
          meta[candidateId] = {
            roomId:
              data?.roomId && typeof data.roomId === "string"
                ? data.roomId
                : undefined,
            waiting:
              typeof data?.waiting === "boolean" ? data.waiting : undefined,
          };
        });

        const uniqueIds = Array.from(new Set(ids));
        const orderedMeta = uniqueIds.reduce<
          Record<string, { roomId?: string; waiting?: boolean }>
        >(
          (acc, id) => {
            acc[id] = meta[id] ?? { roomId: undefined, waiting: undefined };
            return acc;
          },
          {}
        );

        setFriendIds(uniqueIds);
        setFriendMeta(orderedMeta);
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to subscribe to friend list", error);
        setFriendIds([]);
        setFriendMeta({});
        setFriends([]);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.id]);

  useEffect(() => {
    const unsubscribers: Unsubscribe[] = [];

    if (!friendIds.length) {
      setFriends([]);
      return () => undefined;
    }

    friendIds.forEach((friendId) => {
      const friendDocRef = doc(db, "users", friendId);
      const unsubscribe = onSnapshot(friendDocRef, (snapshot) => {
        const data = snapshot.data() as FirestoreUserDoc | undefined;
        setFriends((prev) => {
          const map = new Map(prev.map((item) => [item.id, item]));
          if (data) {
            const profile = userProfileFromDoc(snapshot.id, data);
            const meta = friendMeta[friendId];
            map.set(friendId, {
              ...profile,
              roomId: meta?.roomId,
              waiting: meta?.waiting,
            });
          } else {
            map.delete(friendId);
          }
          return Array.from(map.values()).sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        });
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [friendIds, friendMeta]);

  const addFriendById = useCallback(
    async (rawFriendId: string) => {
      if (!user) {
        throw new Error("ログインが必要です。");
      }
      const friendId = rawFriendId.trim();
      if (!friendId) {
        throw new Error("フレンドIDを入力してください。");
      }
      if (friendId === user.id) {
        throw new Error("自分自身は追加できません。");
      }
      if (friendIds.includes(friendId)) {
        throw new Error("既にフレンドリストに追加済みです。");
      }

      if (!hasValidFunctionsBaseUrl) {
        throw new Error("FunctionsのURLが設定されていません。");
      }

      const response = await fetch(`${functionsBaseUrl}/add_friend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: user.id,
        },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) {
        let message = "フレンドの追加に失敗しました。";
        try {
          const errorBody = await response.json();
          message = errorBody.error ?? message;
        } catch {
          // ignore parse errors
        }
        throw new Error(message);
      }
    },
    [friendIds, user]
  );

  const value = useMemo<FriendsContextValue>(
    () => ({
      friends,
      isLoading,
      addFriendById,
    }),
    [friends, isLoading, addFriendById]
  );

  return (
    <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>
  );
};

export const useFriends = () => {
  const ctx = useContext(FriendsContext);
  if (!ctx) {
    throw new Error("useFriends must be used within a FriendsProvider");
  }
  return ctx;
};

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Daily, {
  DailyCall,
  DailyEventObjectParticipant,
} from "@daily-co/react-native-daily-js";
import { doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import type { CallSession, CallStatus, FriendProfile } from "../types";
import { useAuth } from "./AuthContext";
import {
  buildDailyRoomUrl,
  functionsBaseUrl,
  hasValidFunctionsBaseUrl,
} from "../config/env";
import { db } from "../services/firebase";

type CallContextValue = {
  callObject: DailyCall | null;
  callStatus: CallStatus;
  currentSession: CallSession | null;
  remoteParticipantCount: number;
  isMuted: boolean;
  startCall: (friend: FriendProfile) => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => Promise<void>;
};

type InternalCallState = {
  callObject: DailyCall | null;
  status: CallStatus;
  friend: FriendProfile | null;
  roomId: string | null;
  roomUrl: string | null;
  startedAt: number | null;
  remoteParticipantCount: number;
  isMuted: boolean;
};

const initialState: InternalCallState = {
  callObject: null,
  status: "idle",
  friend: null,
  roomId: null,
  roomUrl: null,
  startedAt: null,
  remoteParticipantCount: 0,
  isMuted: false,
};

const CallContext = createContext<CallContextValue | undefined>(undefined);

export const CallProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { user } = useAuth();
  const [state, setState] = useState<InternalCallState>(initialState);
  const callObjectRef = useRef<DailyCall | null>(null);
  const callStateRef = useRef<InternalCallState>(initialState);
  const hasRecordedRef = useRef(false);

  const setFriendWaitingStatus = useCallback(
    async (friendId: string, waiting: boolean) => {
      if (!user) {
        return;
      }
      try {
        await setDoc(
          doc(db, "users", friendId, "friends", user.id),
          {
            waiting,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.warn("Failed to update waiting status", error);
      }
    },
    [user]
  );

  useEffect(() => {
    callStateRef.current = state;
  }, [state]);

  const clearActiveCallStatus = useCallback(async () => {
    const { friend } = callStateRef.current;
    if (!user) {
      return;
    }
    const tasks: Promise<unknown>[] = [
      updateDoc(doc(db, "users", user.id), { activeCall: null }),
    ];
    if (friend) {
      tasks.push(setFriendWaitingStatus(friend.id, false));
    }
    await Promise.all(tasks);
  }, [setFriendWaitingStatus, user]);

  const recordCallHistory = useCallback(
    async (endedAt: number) => {
      const { friend, startedAt, roomId } = callStateRef.current;
      if (!user || !friend || !startedAt || !roomId) {
        return;
      }
      if (hasRecordedRef.current) {
        return;
      }
      hasRecordedRef.current = true;

      if (!hasValidFunctionsBaseUrl) {
        console.warn(
          "Functions base URL is not configured; skipping call history."
        );
        return;
      }

      try {
        const response = await fetch(`${functionsBaseUrl}/record_call_history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: user.id,
          },
          body: JSON.stringify({
            friendId: friend.id,
            roomId,
          }),
        });

        if (!response.ok) {
          let message = "Failed to record call history.";
          try {
            const errorBody = await response.json();
            if (typeof errorBody?.error === "string") {
              message = errorBody.error;
            }
          } catch {
            // ignore parse errors
          }
          console.warn(message);
        }
      } catch (error) {
        console.warn("Failed to record call history", error);
      }
    },
    [user]
  );

  const resetCall = useCallback(async () => {
    await clearActiveCallStatus().catch((error) => {
      console.warn("Failed to clear active call status", error);
    });
    setState(initialState);
    callStateRef.current = initialState;
    const callObject = callObjectRef.current;
    if (callObject) {
      callObject.destroy?.();
      callObjectRef.current = null;
    }
  }, [clearActiveCallStatus]);

  const handleParticipantsUpdated = useCallback(() => {
    const callObject = callObjectRef.current;
    if (!callObject) {
      return;
    }
    const participants = callObject.participants();
    const remoteCount = Object.values(participants).filter(
      (participant) => !participant.local
    ).length;
    setState((prev) => ({
      ...prev,
      remoteParticipantCount: remoteCount,
    }));
    if (remoteCount > 0) {
      const currentFriendId = callStateRef.current.friend?.id;
      if (currentFriendId) {
        setFriendWaitingStatus(currentFriendId, false);
      }
    }
  }, [setFriendWaitingStatus]);

  const attachCallListeners = useCallback(() => {
    const callObject = callObjectRef.current;
    if (!callObject) {
      return;
    }

    const handleJoined = () => {
      setState((prev) => ({
        ...prev,
        status: "connected",
        startedAt: prev.startedAt ?? Date.now(),
      }));
    };

    const handleLeftMeeting = async () => {
      await recordCallHistory(Date.now());
      await resetCall();
    };

    const handleParticipantEvent = (
      event: DailyEventObjectParticipant
    ): void => {
      if (event.participant && !event.participant.local) {
        handleParticipantsUpdated();
      }
    };

    callObject
      .on("joined-meeting", handleJoined)
      .on("left-meeting", handleLeftMeeting)
      .on("participant-joined", handleParticipantEvent)
      .on("participant-updated", handleParticipantEvent)
      .on("participant-left", () => handleParticipantsUpdated());
  }, [handleParticipantsUpdated, recordCallHistory, resetCall]);

  const startCall = useCallback(
    async (friend: FriendProfile) => {
      if (!user) {
        throw new Error("ログインが必要です。");
      }
      if (state.status !== "idle") {
        await resetCall();
      }
      const roomId = friend.roomId;
      if (!roomId) {
        throw new Error("通話ルームがまだ準備できていません。時間をおいて再試行してください。");
      }
      const roomUrl = buildDailyRoomUrl(roomId);

      const callObject = Daily.createCallObject();
      callObjectRef.current = callObject;
      hasRecordedRef.current = false;
      const initialStart =
        friend.activeCall?.startedAt ?? callStateRef.current.startedAt ?? null;

      setState({
        callObject,
        status: "connecting",
        friend,
        roomId,
        roomUrl,
        startedAt: initialStart,
        remoteParticipantCount: 0,
        isMuted: false,
      });

      const now = Date.now();
      const userDocRef = doc(db, "users", user.id);

      await setDoc(
        userDocRef,
        {
          activeCall: {
            peerId: friend.id,
            roomId,
            startedAt: now,
          },
        },
        { merge: true }
      );

      const shouldMarkWaiting = friend.waiting !== true;
      await setFriendWaitingStatus(friend.id, shouldMarkWaiting);

      attachCallListeners();
      handleParticipantsUpdated();

      try {
        await callObject.join({
          url: roomUrl,
          audioSource: true,
          videoSource: false,
        });
        await callObject.setLocalAudio(true);
        await callObject.setLocalVideo(false);
        try {
          await callObject.startRecording({
              layout: {
                "preset": "raw-tracks-audio-only",
              },
              audioBitrate: 320,
            } as any);
        } catch (error_recording) {
          console.error("Failed to start recording", error_recording);
        }
      } catch (error) {
        console.error("Failed to join Daily room", error);
        await resetCall();
        throw error instanceof Error
          ? error
          : new Error("通話の開始に失敗しました。");
      }
    },
    [
      attachCallListeners,
      handleParticipantsUpdated,
      resetCall,
      setFriendWaitingStatus,
      state.status,
      user,
    ]
  );

  const endCall = useCallback(async () => {
    if (state.status === "idle") {
      return;
    }
    setState((prev) => ({
      ...prev,
      status: "ending",
    }));
    try {
      await callObjectRef.current?.leave();
      await recordCallHistory(Date.now());
    } catch (error) {
      console.error("Failed to leave Daily room", error);
    } finally {
      await resetCall();
    }
  }, [recordCallHistory, resetCall, state.status]);

  const toggleMute = useCallback(async () => {
    const callObject = callObjectRef.current;
    if (!callObject) {
      return;
    }
    const nextMuted = !callStateRef.current.isMuted;
    await callObject.setLocalAudio(!nextMuted);
    setState((prev) => ({
      ...prev,
      isMuted: nextMuted,
    }));
  }, []);

  const currentSession = useMemo<CallSession | null>(() => {
    if (!state.friend || !state.roomId) {
      return null;
    }
    return {
      friend: state.friend,
      roomId: state.roomId,
      startedAt: state.startedAt,
    };
  }, [state.friend, state.roomId, state.startedAt]);

  const value = useMemo<CallContextValue>(
    () => ({
      callObject: state.callObject,
      callStatus: state.status,
      currentSession,
      remoteParticipantCount: state.remoteParticipantCount,
      isMuted: state.isMuted,
      startCall,
      endCall,
      toggleMute,
    }),
    [
      currentSession,
      callObjectRef.current,
      endCall,
      startCall,
      state.isMuted,
      state.remoteParticipantCount,
      state.status,
      toggleMute,
    ]
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return ctx;
};

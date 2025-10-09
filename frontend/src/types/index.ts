export interface ActiveCall {
  peerId: string;
  roomId: string;
  startedAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatarColor: string;
  points: number;
  photoUrl?: string | null;
  activeCall?: ActiveCall | null;
  createdAt?: number;
}

export interface FriendProfile extends UserProfile {
  lastInteractionAt?: number;
  roomId?: string;
  waiting?: boolean;
}

export interface CallHistoryEntry {
  id: string;
  peerId: string;
  peerName: string;
  startedAt: number;
  endedAt: number;
  durationSeconds: number;
  pointsEarned: number;
}

export type CallStatus = "idle" | "connecting" | "connected" | "ending";

export interface FirestoreUserDoc {
  name: string;
  avatarColor: string;
  points: number;
  photoUrl?: string | null;
  activeCall?: {
    peerId: string;
    roomId: string;
    startedAt: number;
  } | null;
  createdAt?: number;
}

export interface FirestoreFriendDoc {
  friendId: string;
  roomId?: string;
  createdAt?: number;
  updatedAt?: number;
  waiting?: boolean;
}

export interface CallSession {
  roomId: string;
  friend: FriendProfile;
  startedAt: number | null;
}

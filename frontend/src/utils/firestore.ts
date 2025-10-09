import type { FirestoreUserDoc, UserProfile } from "../types";
import { colors } from "../theme/colors";

const toMillis = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return value;
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toMillis" in value &&
    typeof (value as { toMillis: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return undefined;
};

export const userProfileFromDoc = (
  id: string,
  data: FirestoreUserDoc
): UserProfile => {
  const activeCallData = data.activeCall ?? null;
  return {
    id,
    name: data.name,
    avatarColor: data.avatarColor ?? colors.primary,
    points: data.points ?? 0,
    photoUrl: data.photoUrl,
    activeCall: activeCallData
      ? {
          peerId: activeCallData.peerId,
          roomId: activeCallData.roomId,
          startedAt: toMillis(activeCallData.startedAt) ?? Date.now(),
        }
      : null,
    createdAt: toMillis(data.createdAt),
  };
};

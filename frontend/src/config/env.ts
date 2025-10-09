import Constants from "expo-constants";

type FirebaseExtraConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

type Extra = {
  dailyDomain?: string;
  functionsBaseUrl?: string;
  firebase?: Partial<FirebaseExtraConfig>;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const firebaseConfig: FirebaseExtraConfig = {
  apiKey: extra.firebase?.apiKey ?? "<YOUR_FIREBASE_API_KEY>",
  authDomain: extra.firebase?.authDomain ?? "<YOUR_FIREBASE_AUTH_DOMAIN>",
  projectId: extra.firebase?.projectId ?? "<YOUR_FIREBASE_PROJECT_ID>",
  storageBucket: extra.firebase?.storageBucket ?? "<YOUR_FIREBASE_STORAGE_BUCKET>",
  messagingSenderId:
    extra.firebase?.messagingSenderId ?? "<YOUR_FIREBASE_MESSAGING_SENDER_ID>",
  appId: extra.firebase?.appId ?? "<YOUR_FIREBASE_APP_ID>",
  measurementId: extra.firebase?.measurementId,
};

export const dailyDomain =
  extra.dailyDomain?.trim() ?? "https://YOUR_DOMAIN.daily.co";

const rawFunctionsBaseUrl =
  extra.functionsBaseUrl?.trim() ?? "https://YOUR_FUNCTIONS_BASE_URL";

export const functionsBaseUrl = rawFunctionsBaseUrl.replace(/\/$/, "");

export const buildDailyRoomUrl = (roomName: string) => {
  const normalizedBase = dailyDomain.endsWith("/")
    ? dailyDomain.slice(0, -1)
    : dailyDomain;
  return `${normalizedBase}/${roomName}`;
};

export const hasValidFirebaseConfig = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && !value.startsWith("<YOUR_FIREBASE")
);

export const hasValidFunctionsBaseUrl =
  typeof extra.functionsBaseUrl === "string" &&
  !extra.functionsBaseUrl.includes("<YOUR_FUNCTIONS_BASE_URL>");

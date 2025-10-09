import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import { firebaseConfig } from "../config/env";
import AsyncStorage from "@react-native-async-storage/async-storage";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// == non-persistent auth
// export const auth = getAuth(app);
// == persistent auth
const persistence = getReactNativePersistence(AsyncStorage);
export const auth = initializeAuth(app, { persistence });
export const db = getFirestore(app);

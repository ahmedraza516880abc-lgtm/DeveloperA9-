/**
 * Firebase Configuration for DroidStore
 * Replace the placeholders below with your actual Firebase project settings
 * found in Firebase Console -> Project Settings -> General -> Your apps -> Web app
 */

import appletConfig from '../firebase-applet-config.json';

/**
 * Firebase Configuration for DroidStore
 * Uses provisioned credentials with environment and placeholder fallbacks
 */
export const firebaseConfig = {
  apiKey: appletConfig.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCqBzMukJxzA5VhO-6Hn7WWDwAASD8Tpf4",
  authDomain: appletConfig.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "robust-parsec-kdtd0.firebaseapp.com",
  projectId: appletConfig.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || "robust-parsec-kdtd0",
  storageBucket: appletConfig.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "robust-parsec-kdtd0.firebasestorage.app",
  messagingSenderId: appletConfig.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "793063950033",
  appId: appletConfig.appId || import.meta.env.VITE_FIREBASE_APP_ID || "1:793063950033:web:bcae1f4b29d988cea8e7f0",
  firestoreDatabaseId: appletConfig.firestoreDatabaseId || "ai-studio-droidstoreandroi-536541d9-b8d2-4647-ab42-c65b15fba0f3"
};

/**
 * Checks if the user has valid Firebase credentials
 */
export const isFirebaseConfigured = () => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    Boolean(firebaseConfig.projectId) &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
};

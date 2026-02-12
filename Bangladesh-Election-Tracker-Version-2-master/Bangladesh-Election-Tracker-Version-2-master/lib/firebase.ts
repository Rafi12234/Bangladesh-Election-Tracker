// Firebase configuration and initialization
// Replace with your actual Firebase config

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration - Use environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate required environment variables
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  throw new Error(
    'Missing required Firebase environment variables. ' +
    'Please copy .env.example to .env.local and add your Firebase configuration.'
  );
}

// Initialize Firebase (singleton pattern)
let firebaseApp: FirebaseApp;
let firebaseDb: Firestore;
let firebaseAuth: Auth;

function initializeFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
  
  firebaseDb = getFirestore(firebaseApp);
  firebaseAuth = getAuth(firebaseApp);
  
  return { app: firebaseApp, db: firebaseDb, auth: firebaseAuth };
}

// Initialize on module load
const firebase = initializeFirebase();

export { firebase };
export const app = firebase.app;
export const db = firebase.db;
export const auth = firebase.auth;
// Keep legacy names for compatibility
export const firestore = firebase.db;

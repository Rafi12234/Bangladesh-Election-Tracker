// Firebase configuration and initialization
// Replace with your actual Firebase config

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Firebase configuration - REPLACE WITH YOUR VALUES
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAAArfD_jceLHDYjxXOe2cZtcNzfAfHT94',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'bd-election-live-tracker.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'bd-election-live-tracker',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'bd-election-live-tracker.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '896769840318',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:896769840318:web:bb2e717b7e321e50b0baef',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-TXR21FKYEQ',
};

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

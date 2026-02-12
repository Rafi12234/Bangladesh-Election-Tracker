/**
 * Reset all declared results and summary in Firestore.
 * Run with: node scripts/reset-results.js
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, serverTimestamp } = require('firebase/firestore');
require('dotenv').config({ path: '.env.local' });

// Load Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Validate environment variables
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Error: Missing Firebase configuration in .env.local');
  console.error('Please copy .env.example to .env.local and add your Firebase credentials.');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function resetResults() {
  console.log('Resetting all declared results...');

  // 1. Delete all documents in 'results' collection
  const resultsSnap = await getDocs(collection(db, 'results'));
  let deleted = 0;
  for (const d of resultsSnap.docs) {
    await deleteDoc(doc(db, 'results', d.id));
    deleted++;
  }
  console.log(`Deleted ${deleted} result documents.`);

  // 2. Reset the summary document
  const emptySummary = {
    totalSeats: 300,
    declaredSeats: 0,
    requiredMajority: 151,
    partySeatCounts: [],
    totalVotesCast: 0,
    totalRegisteredVoters: 127711414,
    nationalTurnout: 0,
    lastUpdated: serverTimestamp(),
  };
  await setDoc(doc(db, 'summary', 'current'), emptySummary);
  console.log('Summary document reset.');

  console.log('Done! All results have been cleared.');
  process.exit(0);
}

resetResults().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

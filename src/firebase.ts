import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;

// Check if all required environment variables are present
for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

console.log("Environment variables for Firebase verified");

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

console.log("Firebase config initialized with database URL:", firebaseConfig.databaseURL);

// Initialize Firebase only if we have all required config
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);

// Test connection to database root
const rootRef = ref(database, '/');
onValue(rootRef, (snapshot) => {
  console.log("Firebase connection test:", snapshot.exists() ? "Success" : "No data at root");
}, (error) => {
  console.error("Firebase connection error:", error);
});

// Test connection to l2stage specifically
const l2stageRef = ref(database, 'l2stage');
onValue(l2stageRef, (snapshot) => {
  console.log("Firebase l2stage test:", snapshot.exists() ? "Success - l2stage exists" : "No l2stage data found");
  if (snapshot.exists()) {
    console.log("l2stage data:", snapshot.val());
  }
}, (error) => {
  console.error("Firebase l2stage error:", error);
});

// Test connection to IsL2Live
const isL2LiveRef = ref(database, 'IsL2Live');
onValue(isL2LiveRef, (snapshot) => {
  console.log("Firebase IsL2Live test:", snapshot.exists() ? "Success - IsL2Live exists" : "No IsL2Live data found");
  if (snapshot.exists()) {
    console.log("IsL2Live data:", snapshot.val());
  }
}, (error) => {
  console.error("Firebase IsL2Live error:", error);
});
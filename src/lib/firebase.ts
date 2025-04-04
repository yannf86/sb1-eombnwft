import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBfTTaMbrnT6NPFJBgZI4FNHz_DXE_4Xc4",
  authDomain: "app-creho-2.firebaseapp.com",
  projectId: "app-creho-2",
  storageBucket: "app-creho-2.firebasestorage.app",
  messagingSenderId: "727196643524",
  appId: "1:727196643524:web:a4de397d842db8d9ec5991"
};

// Initialize Firebase (only if it hasn't been initialized yet)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Add connection timeout handling
const originalFetch = window.fetch;
window.fetch = function(input, init) {
  const timeout = 10000; // 10 seconds timeout
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  const fetchPromise = originalFetch.call(this, input, {
    ...init,
    signal: controller.signal
  });
  
  return fetchPromise.finally(() => clearTimeout(timeoutId));
};

// Check if we're in development mode and use emulators if needed
if (import.meta.env.DEV) {
  try {
    // Check if we should use emulators (can be controlled via env variables)
    const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
    
    if (useEmulators) {
      // Connect to Firestore emulator
      connectFirestoreEmulator(db, 'localhost', 8080);
      // Connect to Storage emulator
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('Connected to Firebase emulators');
    }
  } catch (error) {
    console.error('Failed to connect to Firebase emulators:', error);
  }
}

export default app;
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBfTTaMbrnT6NPFJBgZI4FNHz_DXE_4Xc4",
  authDomain: "app-creho-2.firebaseapp.com",
  projectId: "app-creho-2",
  storageBucket: "app-creho-2.firebasestorage.app",
  messagingSenderId: "727196643524",
  appId: "1:727196643524:web:a4de397d842db8d9ec5991"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
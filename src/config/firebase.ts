import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD0UDvv0BKK_i9lwD6BZukCUvHGEtoHP0k",
  authDomain: "hikingfit-admin.firebaseapp.com",
  projectId: "hikingfit-admin",
  storageBucket: "hikingfit-admin.firebasestorage.app",
  messagingSenderId: "926183535339",
  appId: "1:926183535339:web:929107c19ef3772d8104ae",
  measurementId: "G-JRQQP21027"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
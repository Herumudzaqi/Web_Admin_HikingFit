import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB42swfKfr8banMvrY9aQk0W8FjdR-v9Yg",
  authDomain: "hikingfit-93024.firebaseapp.com",
  projectId: "hikingfit-93024",
  storageBucket: "hikingfit-93024.firebasestorage.app",
  messagingSenderId: "19014984436",
  appId: "1:19014984436:web:7248b7bffeebd4b2ecb4a1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
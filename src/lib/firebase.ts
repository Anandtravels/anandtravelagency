import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyB4P5ZA4znNllXccDWrNgA3B2UTjABf9Xc",
  authDomain: "anandtravelagency-632b6.firebaseapp.com",
  projectId: "anandtravelagency-632b6",
  storageBucket: "anandtravelagency-632b6.firebasestorage.app",
  messagingSenderId: "618252472591",
  appId: "1:618252472591:web:b6efcd59203e227e11ee7a",
  measurementId: "G-2VV1SH2ZCY"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Initialize Firestore with multi-tab persistence support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

console.log('Firebase initialized successfully');

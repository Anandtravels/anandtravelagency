import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

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
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log("Multiple tabs open, persistence can only be enabled in one tab at a time.");
    } else if (err.code === 'unimplemented') {
      console.log("The current browser doesn't support all of the features required to enable persistence");
    }
});

console.log('Firebase initialized successfully');

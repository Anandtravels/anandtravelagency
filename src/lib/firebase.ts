import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, memoryLocalCache, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
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

// Detect problematic browsers (Safari on iOS can have IndexedDB issues)
const isSafari = typeof navigator !== 'undefined' && /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
const isProblematicBrowser = isSafari || isIOS;

// Initialize Firestore with appropriate cache settings
// Use memory cache for iOS/Safari to avoid IndexedDB permission issues
let db;
try {
  if (isProblematicBrowser) {
    // Use memory cache for Safari/iOS to avoid IndexedDB issues
    db = initializeFirestore(app, {
      localCache: memoryLocalCache()
    });
    console.log('Firebase initialized with memory cache (Safari/iOS detected)');
  } else {
    // Use persistent cache for other browsers
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    });
    console.log('Firebase initialized with persistent cache');
  }
} catch (error) {
  // Fallback to memory cache if persistent cache fails
  console.warn('Failed to initialize persistent cache, falling back to memory cache:', error);
  db = initializeFirestore(app, {
    localCache: memoryLocalCache()
  });
}

export { db };

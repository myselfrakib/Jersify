import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { 
  getDatabase, 
  ref, 
  set, 
  get, 
  child, 
  push, 
  update, 
  onValue, 
  remove 
} from 'firebase/database';
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyA4O7ROp8srleiFAZSmiyd6ml7Ruv8eN74",
  authDomain: "jersify-f9b5e.firebaseapp.com",
  databaseURL: "https://jersify-f9b5e-default-rtdb.firebaseio.com",
  projectId: "jersify-f9b5e",
  storageBucket: "jersify-f9b5e.firebasestorage.app",
  messagingSenderId: "461181023878",
  appId: "1:461181023878:web:6ebfbae603baf4a873c307",
  measurementId: "G-V5E7D09PJ0"
};

// Initialize Firebase App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const rtdb = getDatabase(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Analytics is optional and initialized safely on demand to prevent unhandled 403 Installations errors on restricted referrers
let analytics = null;
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && !analytics) {
    try {
      const supported = await isAnalyticsSupported();
      if (supported) {
        analytics = getAnalytics(app);
      }
    } catch (e) {
      // Gracefully ignore if referer restrictions block analytics
    }
  }
  return analytics;
};

// RTDB Compatibility helpers for seamless app operation
const collection = (db, colName) => colName;
const doc = (db, colName, docId) => `${colName}/${docId}`;
const setDoc = async (pathStr, data) => set(ref(rtdb, pathStr), data);
const getDoc = async (pathStr) => {
  const snapshot = await get(ref(rtdb, pathStr));
  return {
    exists: () => snapshot.exists(),
    data: () => snapshot.val(),
    val: () => snapshot.val()
  };
};
const getDocs = async (pathStr) => {
  const snapshot = await get(ref(rtdb, pathStr));
  const val = snapshot.val() || {};
  const docs = Object.keys(val).map(key => ({
    id: key,
    data: () => val[key]
  }));
  return { docs, forEach: (cb) => docs.forEach(cb) };
};
const addDoc = async (colName, data) => {
  const newRef = push(ref(rtdb, colName));
  await set(newRef, data);
  return { id: newRef.key };
};
const updateDoc = async (pathStr, data) => update(ref(rtdb, pathStr), data);
const query = (colName) => colName;
const where = () => {};
const orderBy = () => {};

export {
  app,
  auth,
  rtdb,
  rtdb as db,
  storage,
  analytics,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  updateProfile,
  ref,
  set,
  get,
  child,
  push,
  update,
  onValue,
  remove,
  storageRef,
  uploadBytes,
  getDownloadURL,
  // Compatibility exports mapped to RTDB
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy
};

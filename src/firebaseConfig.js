import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import 'firebase/database'; 

const firebaseConfig = {
  apiKey: "AIzaSyDaIHHzQTVdJEFSz8zCMddCjXIpctxsAc8",
  authDomain: "urbandepot-cbda0.firebaseapp.com",
  projectId: "urbandepot-cbda0",
  storageBucket: "urbandepot-cbda0.appspot.com",
  messagingSenderId: "252298620702",
  appId: "1:252298620702:web:1db6581264aa09a07ca30f",
  measurementId: "G-3GFT54BFGX"
};

// Initialize Firebase app and authentication
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // For authentication
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, storage , googleProvider};
export default db;
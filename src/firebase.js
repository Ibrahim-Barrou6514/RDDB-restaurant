// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDULXvKuvwrvBd-Lzk8hs2T9Vc0kQXR6sU",
    authDomain: "restaurant-rddb.firebaseapp.com",
    projectId: "restaurant-rddb",
    storageBucket: "restaurant-rddb.firebasestorage.app",
    messagingSenderId: "615116356664",
    appId: "1:615116356664:web:7757f37c43042c4d6dbacd",
    measurementId: "G-E88MN2KFX1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
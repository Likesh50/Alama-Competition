// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCelyyrHqRvp3n3qyu20Nt-iOVhfOFCz-4",
  authDomain: "alama-3673a.firebaseapp.com",
  projectId: "alama-3673a",
  storageBucket: "alama-3673a.appspot.com",
  messagingSenderId: "768539232455",
  appId: "1:768539232455:web:2ad20422e02cbb3c1816e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const storage = getStorage(app);
const db = getFirestore(app);
export { auth ,db};
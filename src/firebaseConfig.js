// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from 'firebase/database';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAfXqk1nhgl0LQ8p173pfNR1iQ6kXPL2Cw",
  authDomain: "wareedapp-50a64.firebaseapp.com",
  projectId: "wareedapp-50a64",
  storageBucket: "wareedapp-50a64.firebasestorage.app",
  messagingSenderId: "468944730554",
  appId: "1:468944730554:web:5f709ba96264414e4f4583"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Firebase Auth
const database = getDatabase(app); // Firebase Realtime Database

export { auth, database };
// src/firebase/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAfXqk1nhgl0LQ8p173pfNR1iQ6kXPL2Cw",
  authDomain: "wareedapp-50a64.firebaseapp.com",
  databaseURL: "https://wareedapp-50a64-default-rtdb.firebaseio.com", // Required for Realtime DB
  projectId: "wareedapp-50a64",
  storageBucket: "wareedapp-50a64.appspot.com",
  messagingSenderId: "468944730554",
  appId: "1:468944730554:web:5f709ba96264414e4f4583"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize services
const database = getDatabase(app);

export { auth, database };
// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // Import getFirestore for Firestore access

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyD4zapuzkx7wLujxkbbP-VlPxEnbfJCceQ',
  authDomain: 'booma-project-adc86.firebaseapp.com',
  projectId: 'booma-project-adc86',
  storageBucket: 'booma-project-adc86.appspot.com',
  messagingSenderId: '1072632917180',
  appId: '1:1072632917180:web:eeb4799063dbca010a74b9',
  measurementId: 'G-2EYYE0G33J',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app); // Initialize Firestore

export { app, auth, db }; // Export the app, auth, and db instances

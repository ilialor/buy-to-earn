/**
 * Firebase Configuration
 * This file contains Firebase initialization and configuration
 */

// Firebase configuration
// Replace with your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore settings
db.settings({ timestampsInSnapshots: true });

// Check if user is signed in and update UI accordingly
auth.onAuthStateChanged(user => {
  if (user) {
    console.log('User logged in:', user);
    updateUIOnAuth(user);
  } else {
    console.log('User logged out');
    updateUIOnSignOut();
  }
});

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider(); 
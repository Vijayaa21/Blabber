// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2sW7GcBTn6gNGjTaFqOZpv_h7flXEfB4",
  authDomain: "blabber-924e8.firebaseapp.com",
  projectId: "blabber-924e8",
  storageBucket: "blabber-924e8.firebasestorage.app",
  messagingSenderId: "301520354807",
  appId: "1:301520354807:web:4cd6703b2d3bb243f1c2f2",
  measurementId: "G-S8ZLFZ1QL9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth & Provider
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };

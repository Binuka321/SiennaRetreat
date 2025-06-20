// firebase.ts

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmIejB1xKKRiqQzeVdVEMAEG-lsQZJljg",
  authDomain: "sienna-retreat.firebaseapp.com",
  projectId: "sienna-retreat",
  storageBucket: "sienna-retreat.appspot.com",
  messagingSenderId: "410234921950",
  appId: "1:410234921950:web:37350ef6cef102c1ccf34f",
  measurementId: "G-D57LWCEP0E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, analytics, auth, provider };

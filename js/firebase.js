import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA0ncv8gWUvhUfZTJjt91Cfzeg6fSEyS7Q",
  authDomain: "cashg-a6a1f.firebaseapp.com",
  projectId: "cashg-a6a1f",
  storageBucket: "cashg-a6a1f.firebasestorage.app",
  messagingSenderId: "592904956975",
  appId: "1:592904956975:web:bbedb99e096a08445d2ada",
  measurementId: "G-PGVHMQG76P"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
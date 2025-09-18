// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

// Copy config from Firebase Console → Project Settings → General → SDK setup & config
const firebaseConfig = {
   apiKey: "AIzaSyDRd3BvAQBema-fZjbzIO37xIPxLD2XdWQ",
   authDomain: "fixit-e6e04.firebaseapp.com",
   projectId: "fixit-e6e04",
   storageBucket: "fixit-e6e04.firebasestorage.app",
   messagingSenderId: "160424033046",
   appId: "1:160424033046:web:2de5fc9dd86238964fae37",
   measurementId: "G-L5NCSPJCSZ"

};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

//============================
// FixIt | Admin Login Script
//============================

import { auth } from "../firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("❌ Please fill in both fields");
      return;
    }

    try {
      // Firebase login
      await signInWithEmailAndPassword(auth, email, password);

      alert("✅ Admin login successful!");
      window.location.href = "admin-dashboard.html"; // Redirect
    } catch (err) {
      console.error(err);
      alert("❌ " + err.message);
    }
  });
});

import { auth, db, storage } from "../firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
  // Auth check
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "../auth/login.html";
      return;
    }
    document.getElementById("welcomeText").textContent = `Welcome 👋 ${user.email}`;
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "../auth/login.html");
  });

  // Map picker logic (same as your old one)
  const mapModal = document.getElementById("mapModal");
  const pickBtn = document.getElementById("pickLocationBtn");
  const closeBtn = document.getElementById("closeMapBtn");
  const confirmBtn = document.getElementById("confirmLocationBtn");
  const locationInput = document.getElementById("location");

  let selectedCoords = null;
  let map = null;
  let marker = null;

  pickBtn.addEventListener("click", () => {
    mapModal.style.display = "flex";
    if (!map) {
      map = L.map("map").setView([20.5937, 78.9629], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
      }).addTo(map);

      marker = L.marker([20.5937, 78.9629], { draggable: true });
      marker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        locationInput.value = `Lat: ${pos.lat.toFixed(4)}, Lng: ${pos.lng.toFixed(4)}`;
        selectedCoords = pos;
      });

      map.on("click", (e) => {
        selectedCoords = e.latlng;
        marker.setLatLng(selectedCoords);
        if (!map.hasLayer(marker)) map.addLayer(marker);
        locationInput.value = `Lat: ${selectedCoords.lat.toFixed(4)}, Lng: ${selectedCoords.lng.toFixed(4)}`;
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const latlng = [pos.coords.latitude, pos.coords.longitude];
          map.setView(latlng, 15);
          selectedCoords = L.latLng(latlng);
          marker.setLatLng(selectedCoords);
          if (!map.hasLayer(marker)) map.addLayer(marker);
          locationInput.value = `Lat: ${latlng[0].toFixed(4)}, Lng: ${latlng[1].toFixed(4)}`;
        });
      }
    }
  });

  closeBtn.addEventListener("click", () => mapModal.style.display = "none");
  confirmBtn.addEventListener("click", () => {
    if (!selectedCoords) alert("Pick a location first!");
    else mapModal.style.display = "none";
  });

  // Report submission
  document.getElementById("reportForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const file = document.getElementById("photo").files[0];
    const description = document.getElementById("description").value.trim();
    const category = document.getElementById("category").value;

    if (!file || !selectedCoords) return alert("Please select photo & location");

    try {
      const reportRef = doc(collection(db, "reports"));
      const storageRef = ref(storage, `reports/${reportRef.id}/original.jpg`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await setDoc(reportRef, {
        category,
        description,
        status: "pending",
        photoPath: `reports/${reportRef.id}/original.jpg`,
        photoURL,
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser.uid,
        latitude: selectedCoords.lat,
        longitude: selectedCoords.lng,
      });

      alert("✅ Report submitted!");
      e.target.reset();
      locationInput.value = "";
      selectedCoords = null;
    } catch (err) {
      alert("❌ " + err.message);
    }
  });
});

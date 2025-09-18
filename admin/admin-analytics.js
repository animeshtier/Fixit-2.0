import { auth, db } from "../firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

let allReports = []; // store globally

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "../auth/login.html";
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    signOut(auth).then(() => window.location.href = "../auth/login.html");
  });

  const q = collection(db, "reports");

  onSnapshot(q, (snap) => {
    allReports = snap.docs.map(d => ({
      ...d.data(),
      createdAt: d.data().createdAt?.toDate()
    }));

    renderCharts(allReports);
  });

  // ✅ Listen to filter change
  document.getElementById("dateFilter").addEventListener("change", () => {
    renderCharts(allReports);
  });
});

function renderCharts(reports) {
  const filter = document.getElementById("dateFilter").value;
  let filteredReports = reports;

  if (filter !== "all") {
    const days = parseInt(filter);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    filteredReports = reports.filter(r => r.createdAt && r.createdAt >= cutoff);
  }

  const statusCounts = { pending: 0, in_progress: 0, resolved: 0 };
  const categoryCounts = {};
  const dailyCounts = {};

  filteredReports.forEach(r => {
    if (r.status) statusCounts[r.status]++;

    if (r.category) {
      categoryCounts[r.category] = (categoryCounts[r.category] || 0) + 1;
    }

    if (r.createdAt) {
      const dateStr = r.createdAt.toISOString().split("T")[0];
      dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
    }
  });

  // ✅ Destroy old charts safely
  if (window.statusChart && typeof window.statusChart.destroy === "function") {
    window.statusChart.destroy();
  }
  if (window.categoryChart && typeof window.categoryChart.destroy === "function") {
    window.categoryChart.destroy();
  }
  if (window.timeChart && typeof window.timeChart.destroy === "function") {
    window.timeChart.destroy();
  }

  // Pie Chart - Status
  window.statusChart = new Chart(document.getElementById("statusChart"), {
    type: "pie",
    data: {
      labels: ["Pending", "In Progress", "Resolved"],
      datasets: [{
        data: [statusCounts.pending, statusCounts.in_progress, statusCounts.resolved],
        backgroundColor: ["#f87171", "#facc15", "#4ade80"]
      }]
    }
  });

  // Bar Chart - Category
  window.categoryChart = new Chart(document.getElementById("categoryChart"), {
    type: "bar",
    data: {
      labels: Object.keys(categoryCounts),
      datasets: [{
        label: "Reports by Category",
        data: Object.values(categoryCounts),
        backgroundColor: "#3b82f6"
      }]
    }
  });

  // Line Chart - Reports Over Time
  window.timeChart = new Chart(document.getElementById("timeChart"), {
    type: "line",
    data: {
      labels: Object.keys(dailyCounts),
      datasets: [{
        label: "Reports Submitted",
        data: Object.values(dailyCounts),
        borderColor: "#1d4ed8",
        backgroundColor: "rgba(29, 78, 216, 0.2)",
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Date" } },
        y: { title: { display: true, text: "Reports" }, beginAtZero: true }
      }
    }
  });
}

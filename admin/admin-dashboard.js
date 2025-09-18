// admin-dashboard.js
import { auth, db } from "../firebase.js";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const reportTable = document.getElementById("reportTable").querySelector("tbody");
  const totalReports = document.getElementById("totalReports");
  const pendingCount = document.getElementById("pendingCount");
  const progressCount = document.getElementById("progressCount");
  const resolvedCount = document.getElementById("resolvedCount");

  // ✅ Auth check
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "../auth/admin-login.html";
    }
  });

  // ✅ Logout
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "../auth/admin-login.html";
  });

  // ✅ Load reports
  async function loadReports() {
    const snapshot = await getDocs(collection(db, "reports"));
    let reports = [];
    reportTable.innerHTML = "";

    let pending = 0, inProgress = 0, resolved = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      reports.push({ id, ...data });

      if (data.status === "pending") pending++;
      if (data.status === "in_progress") inProgress++;
      if (data.status === "resolved") resolved++;

      // ✅ Build table row
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>#${id}</td>
        <td>
          <a href="${data.photoURL}" target="_blank">
            <img src="${data.photoURL}" alt="report" class="report-img"/>
          </a>
        </td>
        <td>${data.category}</td>
        <td>${data.description}</td>
        <td>
          <span class="status-badge ${data.status}">
            ${formatStatus(data.status)}
          </span>
        </td>
        <td>${data.createdAt?.toDate().toISOString().split("T")[0] || "N/A"}</td>
        <td>
          ${data.latitude && data.longitude
            ? `<a href="https://maps.google.com/?q=${data.latitude},${data.longitude}" target="_blank">View</a>`
            : "N/A"}
        </td>
        <td></td>
      `;

      // ✅ Dropdown for status
      const statusCell = document.createElement("td");
      const statusDropdown = document.createElement("select");
      ["pending", "in_progress", "resolved"].forEach((s) => {
        const option = document.createElement("option");
        option.value = s;
        option.textContent = formatStatus(s);
        if (s === data.status) option.selected = true;
        statusDropdown.appendChild(option);
      });
      statusCell.appendChild(statusDropdown);

      // ✅ Save button
      const saveBtn = document.createElement("button");
      saveBtn.textContent = "Save";
      saveBtn.className = "btn-save";
      saveBtn.addEventListener("click", async () => {
        const newStatus = statusDropdown.value;
        await updateDoc(doc(db, "reports", id), { status: newStatus });
        alert("✅ Status updated!");
        loadReports(); // refresh
      });

      const actionCell = row.querySelector("td:last-child");
      actionCell.appendChild(statusDropdown);
      actionCell.appendChild(saveBtn);

      reportTable.appendChild(row);
    });

    // ✅ Update counters
    totalReports.textContent = reports.length;
    pendingCount.textContent = pending;
    progressCount.textContent = inProgress;
    resolvedCount.textContent = resolved;
  }

  function formatStatus(status) {
    if (status === "pending") return "Pending";
    if (status === "in_progress") return "In Progress";
    if (status === "resolved") return "Resolved";
    return status;
  }

  loadReports();
});


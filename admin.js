function byId(id) {
  return document.getElementById(id);
}

function formatDate(timestamp) {
  if (!timestamp || !timestamp.toDate) {
    return "-";
  }

  return timestamp.toDate().toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function toEpochMillis(timestamp) {
  if (!timestamp || !timestamp.toDate) {
    return 0;
  }

  return timestamp.toDate().getTime();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatOrderItems(items, address) {
  if (!Array.isArray(items) || items.length === 0) {
    return address ? `Address: ${address}` : "-";
  }

  const itemDetails = items
    .map(item => `${item.name || item.category || "Product"} (${item.price || "N/A"})`)
    .join(", ");
  
  return address ? `${itemDetails} | Address: ${address}` : itemDetails;
}

function renderDashboardRows(state) {
  const tableBody = byId("dashboardRows");

  if (!tableBody) {
    return;
  }

  if (!state.enquiriesLoaded || !state.ordersLoaded) {
    tableBody.innerHTML = '<tr><td colspan="6">Loading records...</td></tr>';
    return;
  }

  const combinedRows = [
    ...state.enquiries.map(entry => ({
      type: "Enquiry",
      name: entry.name || "-",
      email: entry.email || "-",
      phone: entry.phone || "-",
      details: formatOrderItems(order.items, order.address),
      createdAt: entry.createdAt
    })),
    ...state.orders.map(order => ({
      type: "Order",
      name: order.name || "-",
      email: order.email || "-",
      phone: order.phone || "-",
      details: formatOrderItems(order.items),
      createdAt: order.createdAt
    }))
  ].sort((a, b) => toEpochMillis(b.createdAt) - toEpochMillis(a.createdAt));

  if (combinedRows.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="6">No enquiries or orders found.</td></tr>';
    return;
  }

  let warningRow = "";
  if (state.enquiriesError || state.ordersError) {
    const enquiryError = state.enquiriesError ? `Enquiries: ${state.enquiriesError}` : "";
    const ordersError = state.ordersError ? `Orders: ${state.ordersError}` : "";
    warningRow = `<tr><td colspan="6">Warning: ${escapeHtml(enquiryError)} ${escapeHtml(ordersError)}</td></tr>`;
  }

  tableBody.innerHTML = warningRow + combinedRows
    .map(row => `
      <tr>
        <td>${escapeHtml(row.type)}</td>
        <td>${escapeHtml(row.name)}</td>
        <td>${escapeHtml(row.email)}</td>
        <td>${escapeHtml(row.phone)}</td>
        <td>${escapeHtml(row.details)}</td>
        <td>${formatDate(row.createdAt)}</td>
      </tr>
    `)
    .join("");
}

function setLoggedInView(user) {
  byId("loginCard").style.display = "none";
  byId("dashboard").style.display = "block";
  byId("adminUser").textContent = user.email || "-";
}

function setLoggedOutView() {
  byId("loginCard").style.display = "block";
  byId("dashboard").style.display = "none";
  byId("adminUser").textContent = "-";
}

window.addEventListener("DOMContentLoaded", () => {
  const loginForm = byId("loginForm");
  const loginError = byId("loginError");
  const logoutBtn = byId("logoutBtn");
  const uploadCsvBtn = byId("uploadCsvBtn");
  
  const state = {
    enquiries: [],
    orders: [],
    enquiriesError: "",
    ordersError: "",
    enquiriesLoaded: false,
    ordersLoaded: false
  };

  const listeners = {
    enquiriesUnsubscribe: null,
    ordersUnsubscribe: null
  };

  function clearListeners() {
    if (listeners.enquiriesUnsubscribe) {
      listeners.enquiriesUnsubscribe();
      listeners.enquiriesUnsubscribe = null;
    }

    if (listeners.ordersUnsubscribe) {
      listeners.ordersUnsubscribe();
      listeners.ordersUnsubscribe = null;
    }
  }

  function resetState() {
    state.enquiries = [];
    state.orders = [];
    state.enquiriesError = "";
    state.ordersError = "";
    state.enquiriesLoaded = false;
    state.ordersLoaded = false;
  }

  if (!window.firebase || !window.auth || !window.db) {
    loginError.textContent = "Firebase is not initialized correctly.";
    return;
  }

  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    loginError.textContent = "";

    const email = byId("adminEmail").value.trim();
    const password = byId("adminPassword").value;

    window.auth.signInWithEmailAndPassword(email, password).catch(error => {
      loginError.textContent = error.message;
    });
  });

  logoutBtn.addEventListener("click", () => {
    window.auth.signOut();
  });
  
  uploadCsvBtn.addEventListener("click", () => {
    window.uploadCSV();
  });

  window.auth.onAuthStateChanged(user => {
    if (user) {
      setLoggedInView(user);
      resetState();
      renderDashboardRows(state);

      listeners.enquiriesUnsubscribe = window.db
        .collection("enquiries")
        .onSnapshot(snapshot => {
          state.enquiries = snapshot.docs.map(doc => doc.data());
          state.enquiriesLoaded = true;
          state.enquiriesError = "";
          renderDashboardRows(state);
        }, error => {
          state.enquiriesLoaded = true;
          state.enquiriesError = error.message;
          renderDashboardRows(state);
        });

      listeners.ordersUnsubscribe = window.db
        .collection("orders")
        .onSnapshot(snapshot => {
          state.orders = snapshot.docs.map(doc => doc.data());
          state.ordersLoaded = true;
          state.ordersError = "";
          renderDashboardRows(state);
        }, error => {
          state.ordersLoaded = true;
          state.ordersError = error.message;
          renderDashboardRows(state);
        });

      return;
    }

    clearListeners();
    resetState();
    renderDashboardRows(state);
    setLoggedOutView();
  });
});

function parseCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function isValidCsvFile(file) {
  const fileName = String(file?.name || "").toLowerCase();
  return fileName.endsWith(".csv");
}

function isLikelyBinaryContent(content) {
  if (!content) return false;

  if (content.includes("\u0000")) {
    return true;
  }

  const sample = content.slice(0, 3000);
  let controlChars = 0;

  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i);
    if (code < 9 || (code > 13 && code < 32)) {
      controlChars++;
    }
  }

  return controlChars > 20;
}

window.uploadCSV = async function() {

  const fileInput = document.getElementById("csvFile");
  const status = document.getElementById("uploadStatus");

  if (!fileInput || !status) {
    alert("Upload controls not found.");
    return;
  }

  if (!fileInput.files.length) {
    alert("Please select a CSV file.");
    return;
  }

  const uploadBtn = byId("uploadCsvBtn");
  const file = fileInput.files[0];

  if (!isValidCsvFile(file)) {
    status.textContent = "Please upload only a .csv file (not .xlsx/.xls).";
    return;
  }

  const reader = new FileReader();

  status.textContent = "Uploading...";
  if (uploadBtn) {
    uploadBtn.disabled = true;
  }

  reader.onload = async function(e) {
    try {
      const content = String(e.target?.result || "").replace(/\r/g, "");

      if (isLikelyBinaryContent(content)) {
        status.textContent = "Invalid file content. Please upload a valid text CSV file.";
        return;
      }

      const lines = content
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

      if (!lines.length) {
        status.textContent = "No product rows found in CSV.";
        return;
      }

      const firstRow = parseCsvLine(lines[0]).map(cell => cell.toLowerCase());
      const expectedHeaders = ["name", "category", "categorykey", "price", "stock", "image", "description", "status"];
      const looksLikeHeader = expectedHeaders.every((header, index) =>
        String(firstRow[index] || "").replace(/\s+/g, "") === header
      );

      const startRow = looksLikeHeader ? 1 : 0;

      if (lines.length <= startRow) {
        status.textContent = "No product rows found in CSV.";
        return;
      }

      let count = 0;
      const uploadTasks = [];

      for (let i = startRow; i < lines.length; i++) {
        const data = parseCsvLine(lines[i]);

        if (!data.length || !data[0]) {
          continue;
        }

        const product = {
          name: data[0] || "",
          category: data[1] || "",
          categoryKey: (data[2] || "").toLowerCase(),
          price: data[3] || "",
          stock: parseInt(data[4], 10) || 0,
          image: data[5] || "",
          description: data[6] || "",
          status: data[7] || "Active",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        uploadTasks.push(window.db.collection("products").add(product));
        count++;
      }

      if (!uploadTasks.length) {
        status.textContent = "No valid product rows found in CSV.";
        return;
      }

      await Promise.all(uploadTasks);
      status.textContent = count + " products uploaded successfully!";
      fileInput.value = "";
    } catch (error) {
      status.textContent = "Upload failed: " + error.message;
    } finally {
      if (uploadBtn) {
        uploadBtn.disabled = false;
      }
    }
  };

  reader.onerror = function() {
    status.textContent = "Unable to read CSV file.";
    if (uploadBtn) {
      uploadBtn.disabled = false;
    }
  };

  reader.readAsText(file);
};

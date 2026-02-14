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

function formatOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "-";
  }

  return items
    .map(item => `${item.category || "Product"} (${item.price || "N/A"})`)
    .join(", ");
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
      details: entry.message || "-",
      createdAt: entry.createdAt
    })),
    ...state.orders.map(order => ({
      type: "Order",
      name: order.name || "-",
      email: "-",
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

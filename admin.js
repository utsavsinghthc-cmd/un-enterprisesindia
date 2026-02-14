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

  if (state.enquiriesError || state.ordersError) {
    const enquiryError = state.enquiriesError ? `Enquiries: ${state.enquiriesError}` : "";
    const ordersError = state.ordersError ? `Orders: ${state.ordersError}` : "";
    tableBody.innerHTML = `<tr><td colspan="6">Error loading data. ${enquiryError} ${ordersError}</td></tr>`;
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

  tableBody.innerHTML = combinedRows
    .map(row => `
      <tr>
        <td>${row.type}</td>
        <td>${row.name}</td>
        <td>${row.email}</td>
        <td>${row.phone}</td>
        <td>${row.details}</td>
        <td>${formatDate(row.createdAt)}</td>
      </tr>
    `)
    .join("");
}

function formatOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return "-";
  }

  return items
    .map(item => `${item.category || "Product"} (${item.price || "N/A"})`)
    .join(", ");
}

function renderOrders(snapshot) {
  const tableBody = byId("orderRows");

  if (snapshot.empty) {
    tableBody.innerHTML = '<tr><td colspan="4">No orders found.</td></tr>';
    return;
  }

  tableBody.innerHTML = snapshot.docs
    .map(doc => {
      const order = doc.data();
      return `
        <tr>
          <td>${order.name || "-"}</td>
          <td>${order.phone || "-"}</td>
          <td>${formatOrderItems(order.items)}</td>
          <td>${formatDate(order.createdAt)}</td>
        </tr>
      `;
    })
    .join("");
}


function setLoggedInView(user) {
  byId("loginCard").style.display = "none";
  byId("dashboard").style.display = "block";
  byId("adminUser").textContent = user.email;
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
    ordersError: ""
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
      window.db
        .collection("enquiries")
        .orderBy("createdAt", "desc")
        .onSnapshot(renderEnquiries, error => {
          byId("enquiryRows").innerHTML = `<tr><td colspan="5">Error: ${error.message}</td></tr>`;
        });

       window.db
        .collection("orders")
        .orderBy("createdAt", "desc")
        .onSnapshot(renderOrders, error => {
          byId("orderRows").innerHTML = `<tr><td colspan="4">Error: ${error.message}</td></tr>`;
        });
    } else {
      setLoggedOutView();
    }
  });
});

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

function renderEnquiries(snapshot) {
  const tableBody = byId("enquiryRows");

  if (snapshot.empty) {
    tableBody.innerHTML = '<tr><td colspan="5">No enquiries found.</td></tr>';
    return;
  }

  tableBody.innerHTML = snapshot.docs
    .map(doc => {
      const entry = doc.data();
      return `
        <tr>
          <td>${entry.name || "-"}</td>
          <td>${entry.email || "-"}</td>
          <td>${entry.phone || "-"}</td>
          <td>${entry.message || "-"}</td>
          <td>${formatDate(entry.createdAt)}</td>
        </tr>
      `;
    })
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

  if (!window.firebase || !window.auth || !window.db) {
    loginError.textContent = "Firebase is not initialized correctly.";
    return;
  }

  loginForm.addEventListener("submit", event => {
    event.preventDefault();
    loginError.textContent = "";

    const email = byId("adminEmail").value.trim();
    const password = byId("adminPassword").value;

    window.auth
      .signInWithEmailAndPassword(email, password)
      .catch(error => {
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

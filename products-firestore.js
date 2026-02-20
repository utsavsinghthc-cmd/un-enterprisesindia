function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let allProducts = [];
let visibleProducts = [];
let cart = [];

/* ===============================
   SAFE PRODUCT FIELD MAPPING
================================ */
function normalizeProduct(raw) {
  return {
    id: raw.id,
    name: raw.name || raw["Product Name"] || "Product",
     category: raw.category || raw.Category || "General",
    categoryKey: (raw.categoryKey || raw["Category Key"] || "").toLowerCase(),
    price: raw.price || raw.Price || "-",
    image: raw.image || raw["Image Path (images/filename.jpg)"] || raw.imagePath || "",
    description: raw.description || raw.Description || "",
    stock: raw.stock || raw.Stock || 0,
    status: raw.status || raw.Status || "Active"
  };
}

/* ===============================
   RENDER PRODUCTS
================================ */
function renderProducts(products) {

  const container = byId("products");

  if (!container) return;

  if (!products.length) {
    container.innerHTML = "<p>No products available.</p>";
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product-card">
      ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">` : ""}
      <h3>${escapeHtml(product.name)}</h3>
      <p><b>Price:</b> ${escapeHtml(product.price)}</p>
      <p>${escapeHtml(product.description)}</p>
      <button onclick="addToCart('${product.id}')">
        Add to Cart
      </button>
    </div>
  `).join("");
}

/* ===============================
   FILTER + SEARCH
================================ */
window.filterCategory = function(categoryKey) {
  const normalizedKey = String(categoryKey || "").toLowerCase();

  if (normalizedKey === "all") {
    visibleProducts = [...allProducts];
    renderProducts(visibleProducts);
    return;
  }

  visibleProducts = allProducts.filter(product => {
    const key = String(product.categoryKey || product.category || "").toLowerCase();
    return key === normalizedKey;
  });

  renderProducts(visibleProducts);
};

window.searchProducts = function() {
  const searchInput = byId("search");
  const value = String(searchInput?.value || "").trim().toLowerCase();

  if (!value) {
    renderProducts(visibleProducts.length ? visibleProducts : allProducts);
    return;
  }

  const searchBase = visibleProducts.length ? visibleProducts : allProducts;

  const filtered = searchBase.filter(product => {
    const name = String(product.name || "").toLowerCase();
    const category = String(product.category || "").toLowerCase();
    const description = String(product.description || "").toLowerCase();
    return name.includes(value) || category.includes(value) || description.includes(value);
  });

  renderProducts(filtered);
};

/* ===============================
   CART FUNCTIONS
================================ */
window.addToCart = function(id) {

  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  cart.push(product);
  byId("cartCount").textContent = cart.length;
};

window.openCart = function() {

  const box = byId("cartItems");
  const popup = byId("cartPopup");

  if (!box || !popup) return;

  if (!cart.length) {
    box.innerHTML = "<p>Cart is empty</p>";
  } else {
    box.innerHTML = cart.map((item, index) => `
      <div class="cart-item">
        <b>${escapeHtml(item.name)}</b>
        <p>${escapeHtml(item.price)}</p>
        <button onclick="removeFromCart(${index})">
          Remove
        </button>
      </div>
    `).join("");
  }

  popup.style.display = "block";
};

window.removeFromCart = function(index) {
  cart.splice(index, 1);
  byId("cartCount").textContent = cart.length;
  openCart();
};

window.closeCart = function() {
  byId("cartPopup").style.display = "none";
};

/* ===============================
   CHECKOUT
================================ */
window.checkout = function() {

  if (!cart.length) {
    alert("Cart is empty.");
    return;
  }

  const order = {
    name: "Website Order",
    phone: "-",
    items: cart,
    status: "Pending",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  window.db.collection("orders").add(order);

  let message = "Hello UN ENTERPRISES,%0A%0AI want to order:%0A";

  cart.forEach(item => {
    message += `- ${item.name} (${item.price})%0A`;
  });

  window.open(
    "https://wa.me/916386319056?text=" + message,
    "_blank"
  );

  cart = [];
  byId("cartCount").textContent = 0;
  closeCart();
};

/* ===============================
   FIRESTORE LOAD
================================ */
window.addEventListener("DOMContentLoaded", () => {

  if (!window.db) {
    console.error("Firestore not initialized");
    return;
  }

  window.db.collection("products")
    .onSnapshot(snapshot => {

      allProducts = snapshot.docs.map(doc =>
        normalizeProduct({
          id: doc.id,
          ...doc.data()
        })
      );

       visibleProducts = [...allProducts];
      
      console.log("Products loaded:", allProducts);

      renderProducts(allProducts);
    });

});

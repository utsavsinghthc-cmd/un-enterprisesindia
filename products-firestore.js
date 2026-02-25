function byId(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let allProducts = [];
let visibleProducts = [];


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
    description: raw.description || raw.Description || ""
  };
}


/* ===============================
   RENDER PRODUCTS
================================ */
function renderProducts(products) {
  const container = byId("products");

 if (!container) {
    return;
  }

  if (!products.length) {
    container.innerHTML = "<p>No products available.</p>";
    return;
  }

 container.innerHTML = products.map(function (product) {
    return `
      <div class="product-card">
        ${product.image ? `<img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">` : ""}
        <h3>${escapeHtml(product.name)}</h3>
        <p><b>Price:</b> ${escapeHtml(product.price)}</p>
        <p>${escapeHtml(product.description)}</p>
        <button onclick="addToCart('${product.id}')">Add to Cart</button>
      </div>
    `;
  }).join("");
}

function refreshCartCount() {
  const cartCount = byId("cartCount");
  if (cartCount && window.cartStore) {
    cartCount.textContent = window.cartStore.getCartCount();
  }
}

/* ===============================
   FILTER + SEARCH
================================ */
window.filterCategory = function (categoryKey) {
  const normalizedKey = String(categoryKey || "").toLowerCase();

  if (normalizedKey === "all") {
    visibleProducts = [...allProducts];
    renderProducts(visibleProducts);
    return;
  }

  visibleProducts = allProducts.filter(function (product) {
    const key = String(product.categoryKey || product.category || "").toLowerCase();
    return key === normalizedKey;
  });

  renderProducts(visibleProducts);
};

window.searchProducts = function () {
  const searchInput = byId("search");
  const value = String(searchInput?.value || "").trim().toLowerCase();

  if (!value) {
    renderProducts(visibleProducts.length ? visibleProducts : allProducts);
    return;
  }

  const searchBase = visibleProducts.length ? visibleProducts : allProducts;

 const filtered = searchBase.filter(function (product) {
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
window.addToCart = function (id) {
  const product = allProducts.find(function (entry) {
    return entry.id === id;
  });

  if (!product || !window.cartStore) {
    return;
  }

window.cartStore.addItem(product);
  refreshCartCount();
  alert("Item added to cart.");
};

/* ===============================
   FIRESTORE LOAD
================================ */
window.addEventListener("DOMContentLoaded", function () {
  refreshCartCount();

  if (!window.db) {
    console.error("Firestore not initialized");
    return;
  }

   window.db.collection("products").onSnapshot(function (snapshot) {
    allProducts = snapshot.docs.map(function (doc) {
      return normalizeProduct({ id: doc.id, ...doc.data() });
    });

     visibleProducts = [...allProducts];
    renderProducts(allProducts);
  });
});

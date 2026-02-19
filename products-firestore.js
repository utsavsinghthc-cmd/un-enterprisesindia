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
let cart = [];

function renderProducts(products) {

  const container = byId("products");

  if (!products.length) {
    container.innerHTML = "<p>No products available.</p>";
    return;
  }

  container.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      <h3>${escapeHtml(product.name)}</h3>
      <p><b>Price:</b> ${escapeHtml(product.price)}</p>
      <p>${escapeHtml(product.description)}</p>

      <button onclick="addToCart('${product.id}')">
        Add to Cart
      </button>
    </div>
  `).join("");
}

function addToCart(id) {

  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  cart.push(product);
  byId("cartCount").textContent = cart.length;
}

window.openCart = function() {

  const box = byId("cartItems");
  const popup = byId("cartPopup");

  if (!cart.length) {
    box.innerHTML = "<p>Cart is empty</p>";
  } else {
    box.innerHTML = cart.map((item, index) => `
      <div>
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

window.closeCart = function() {
  byId("cartPopup").style.display = "none";
};

window.addEventListener("DOMContentLoaded", () => {

  window.db.collection("products")
    .where("status", "==", "Active")
    .onSnapshot(snapshot => {

      allProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      renderProducts(allProducts);
    });

});

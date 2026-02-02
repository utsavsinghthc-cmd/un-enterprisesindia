let allProducts = [];
let cart = [];

/* LOAD PRODUCTS */
fetch("products.json?v=FINAL_2026")
  .then(response => response.json())
  .then(data => {
    allProducts = data;
    renderProducts(data);
  })
  .catch(err => {
    console.error("JSON load failed:", err);
  });

/* RENDER PRODUCTS */
function renderProducts(data) {
  let html = "";

  data.forEach((cat, index) => {
    html += `
      <div class="product-card">
        <img src="${cat.image}">
        <h3>${cat.category}</h3>
        <p><b>Price:</b> ${cat.price}</p>
        <ul>
          ${cat.products.map(p => `<li>${p}</li>`).join("")}
        </ul>
        <button onclick="addToCart(${index})">Add to Cart</button>
      </div>
    `;
  });

  document.getElementById("products").innerHTML = html;
}

/* FILTER */
function filterCategory(key) {
  if (key === "all") {
    renderProducts(allProducts);
    return;
  }
  const filtered = allProducts.filter(p => p.categoryKey === key);
  renderProducts(filtered);
}

/* SEARCH */
function searchProducts() {
  const val = document.getElementById("search").value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.category.toLowerCase().includes(val)
  );
  renderProducts(filtered);
}

/* CART */
function addToCart(index) {
  cart.push(allProducts[index]);
  document.getElementById("cartCount").innerText = cart.length;
}

function openCart() {
  const box = document.getElementById("cartItems");
  const popup = document.getElementById("cartPopup");

  if (cart.length === 0) {
    box.innerHTML = "<p>Your cart is empty</p>";
  } else {
    box.innerHTML = cart.map((c, i) => `
      <div class="cart-item">
        <b>${c.category}</b><br>
        ${c.price}<br>
        <button onclick="removeFromCart(${i})">Remove</button>
      </div>
    `).join("");
  }

  popup.style.display = "block";
}

function closeCart() {
  document.getElementById("cartPopup").style.display = "none";
}

function removeFromCart(i) {
  cart.splice(i, 1);
  document.getElementById("cartCount").innerText = cart.length;
  openCart();
}

function checkout() {
  let msg = "Hello UN ENTERPRISES,\nGSTIN: 09BFEPS7093M1ZK\n\nI want to enquire about:\n";
  cart.forEach(c => {
    msg += `- ${c.category} (${c.price})\n`;
  });

  window.open(
    "https://wa.me/916386319056?text=" + encodeURIComponent(msg),
    "_blank"
  );
}

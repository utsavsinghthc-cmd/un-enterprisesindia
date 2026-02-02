let allProducts = [];
let cart = [];

/* LOAD PRODUCTS */
fetch("products.json")
  .then(r => r.json())
  .then(data => {
    allProducts = data;
    renderProducts(allProducts);
  });

/* RENDER PRODUCTS */
function renderProducts(list) {
  let html = "";

  list.forEach((cat, idx) => {
    html += `
      <div class="product-card">
        <img src="${cat.image}">
        <h3>${cat.category}</h3>
        <p><b>Price:</b> ${cat.price}</p>

        <ul>
          ${cat.products.map(item => `<li>${item}</li>`).join("")}
        </ul>

        <button onclick="addToCart(${idx})">Add to Cart</button>
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
  const v = document.getElementById("search").value.toLowerCase();
  const filtered = allProducts.filter(p =>
    p.category.toLowerCase().includes(v)
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

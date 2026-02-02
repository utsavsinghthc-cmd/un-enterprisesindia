let allProducts = [];
let cart = [];

/* LOAD PRODUCTS */
fetch("products.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderProducts(allProducts);
  });

/* RENDER PRODUCTS */
function renderProducts(list) {
  let html = "";

  list.forEach(product => {
    html += `
      <div class="product-card">
        <img src="${product.image}">
        <h3>${product.category}</h3>
        <p><b>Price:</b> ${product.price}</p>

        <ul>
          ${product.products.map(i => `<li>${i}</li>`).join("")}
        </ul>

        <button onclick='addToCart(${JSON.stringify(product)})'>
          Add to Cart
        </button>
      </div>
    `;
  });

  document.getElementById("products").innerHTML = html;
}

/* FILTER */
function filterCategory(key) {
  if (key === "all") {
    renderProducts(allProducts);
  } else {
    renderProducts(allProducts.filter(p => p.categoryKey === key));
  }
}

/* SEARCH */
function searchProducts() {
  const val = document.getElementById("search").value.toLowerCase();
  renderProducts(
    allProducts.filter(p =>
      p.category.toLowerCase().includes(val)
    )
  );
}

/* CART */
function addToCart(product) {
  cart.push(product);
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
  if (cart.length === 0) {
    alert("Cart is empty");
    return;
  }

  let msg =
    "Hello UN ENTERPRISES,\nGSTIN: 09BFEPS7093M1ZK\n\nI want to enquire about:\n";

  cart.forEach(c => {
    msg += `- ${c.category} (${c.price})\n`;
  });

  window.open(
    "https://wa.me/916386319056?text=" + encodeURIComponent(msg),
    "_blank"
  );
}

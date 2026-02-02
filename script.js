let allProducts = [];
let cart = [];

/* LOAD PRODUCTS */
fetch("products.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderProducts(allProducts);
  });

/* RENDER PRODUCTS (SAFE VERSION) */
function renderProducts(list) {
  let html = "";

  list.forEach(product => {
    html += `
      <div class="product-card">
        <img src="${product.image}">
        <h3>${product.category}</h3>
        <p><b>Price:</b> ${product.price}</p>

        <ul>
          ${product.products.map(item => `<li>${item}</li>`).join("")}
        </ul>

        <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
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

  if (

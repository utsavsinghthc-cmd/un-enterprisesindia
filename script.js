let allProducts = [];
let cart = [];

/* LOAD PRODUCTS */
fetch("products.json")
  .then(r => r.json())
  .then(data => {
    allProducts = data;
    show(allProducts);
  });

function show(list) {
  let out = "";
  list.forEach((p, i) => {
    out += `
      <div class="product-card">
        <img src="${p.image}">
        <h3>${p.category}</h3>
        <p>${p.price}</p>
        <button onclick="addToCart(${i})">Add to Cart</button>
      </div>
    `;
  });
  document.getElementById("products").innerHTML = out;
}

/* FILTER */
function filterCategory(key) {
  if (key === "all") {
    show(allProducts);
  } else {
    show(allProducts.filter(p => p.categoryKey === key));
  }
}

/* SEARCH */
function searchProducts() {
  let v = document.getElementById("search").value.toLowerCase();
  show(allProducts.filter(p => p.category.toLowerCase().includes(v)));
}

/* CART */
function addToCart(i) {
  cart.push(allProducts[i]);
  document.getElementById("cartCount").innerText = cart.length;
}


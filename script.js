let allProducts = [];
let cart = [];

/* LOAD PRODUCTS */
fetch("products.json")
  .then(res => res.json())
  .then(data => {
      allProducts = data;
      showProducts(data);
  })
  .catch(err => {
      console.error("JSON load error:", err);
  });

/* SHOW PRODUCTS */
function showProducts(data) {
    let html = "";

    data.forEach((cat, index) => {
        html += `
        <div class="product-card" data-category="${cat.categoryKey}">
            <img src="${cat.image}">
            <h3>${cat.category}</h3>
            <p><b>Price:</b> ${cat.price}</p>
            <ul>
                ${cat.products.map(p => `<li>${p}</li>`).join("")}
            </ul>
            <button onclick="addToCart(${index})">Add to Cart</button>
        </div>`;
    });

    document.getElementById("products").innerHTML = html;
}

/* FILTER */
function filterCategory(key) {
    if (key === "all") {
        showProducts(allProducts);
        return;
    }

    let filtered = allProducts.filter(p => p.categoryKey === key);
    showProducts(filtered);
}

/* SEARCH */
function searchProducts() {
    let val = document.getElementById("search").value.toLowerCase();

    let filtered = allProducts.filter(p =>
        p.category.toLowerCase().includes(val)
    );

    showProducts(filtered);
}

/* CART */
function addToCart(i) {
    cart.push(allProducts[i]);
    document.getElementById("cartCount").innerText = cart.length;
}

function openCart() {
    let itemsBox = document.getElementById("cartItems");
    let popup = document.getElementById("cartPopup");

    if (cart.length === 0) {
        itemsBox.innerHTML = "<p>Your cart is empty</p>";
    } else {
        itemsBox.innerHTML = cart.map((c, i) => `
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

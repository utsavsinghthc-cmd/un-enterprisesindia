let allProducts = [];
let cart = [];

/* LOAD PRODUCTS */
fetch("products.json")
  .then(res => res.json())
  .then(data => {
    allProducts = data;
    renderProducts(allProducts);
  })
  .catch(err => console.error(err));

/* RENDER PRODUCTS */
function renderProducts(list) {
  const container = document.getElementById("products");
  let html = "";

  list.forEach(product => {
    const index = allProducts.indexOf(product);

    html += `
      <div class="product-card">
        <img src="${product.image}" alt="${product.category} product" loading="lazy" width="320" height="180">
        <h3>${product.category}</h3>
        <p><b>Price:</b> ${product.price}</p>
        <ul>
          ${product.products.map(p => `<li>${p}</li>`).join("")}
        </ul>
        <button onclick="addToCart(${index})">Add to Cart</button>
      </div>
    `;
  });

  container.innerHTML = html;
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

   popup.style.display = "flex";
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

  const customerName = prompt("Enter your name:");
  const customerPhone = prompt("Enter your phone number:");

  if (!customerName || !customerPhone) {
    alert("Name and phone required");
    return;
  }

  const orderData = {
    name: customerName,
    phone: customerPhone,
    items: cart,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  db.collection("orders").add(orderData)
    .then(() => {
      let msg = "Hello UN ENTERPRISES,\n\nNew Order:\n";
      msg += "Name: " + customerName + "\n";
      msg += "Phone: " + customerPhone + "\n\nProducts:\n";

      cart.forEach(item => {
        msg += "- " + item.category + " (" + item.price + ")\n";
      });

      window.open(
        "https://wa.me/916386319056?text=" + encodeURIComponent(msg),
        "_blank"
      );

      alert("Order Saved Successfully!");
      cart = [];
      document.getElementById("cartCount").innerText = 0;
      closeCart();
    })
    .catch(error => {
      alert("Error saving order: " + error.message);
    });
}

let allProducts = [];
let cart = [];

/* LOAD PRODUCTS */
fetch("products.json")
.then(res => res.json())
.then(data => {
    allProducts = data;
    displayProducts(data);
});

/* DISPLAY PRODUCTS */
function displayProducts(data) {
    let html = "";
    data.forEach((cat, index) => {
        html += `
        <div class="product-card" data-category="${cat.categoryKey}">
            <img src="${cat.image}">
            <h3>${cat.category}</h3>
            <p><b>Price:</b> ${cat.price}</p>
            <ul>`;
        cat.products.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += `
            </ul>
            <button onclick="addToCart(${index})">Add to Cart</button>
        </div>`;
    });
    document.getElementById("products").innerHTML = html;
}

/* FILTER BY CATEGORY */
function filterCategory(key) {
    if (key === "all") {
        displayProducts(allProducts);
        return;
    }
    let filtered = allProducts.filter(c => c.categoryKey === key);
    displayProducts(filtered);
}

/* SEARCH */
function searchProducts() {
    let val = document.getElementById("search").value.toLowerCase();
    let filtered = allProducts.filter(c =>
        c.category.toLowerCase().includes(val)
    );
    displayProducts(filtered);
}

/* CART FUNCTIONS */
function addToCart(index) {
    cart.push(allProducts[index]);
    document.getElementById("cartCount").innerText = cart.length;
}

function openCart() {
    let popup = document.getElementById("cartPopup");
    let itemsBox = document.getElementById("cartItems");

    if (cart.length === 0) {
        itemsBox.innerHTML = "<p>Your cart is empty</p>";
    } else {
        let html = "";
        cart.forEach((c, i) => {
            html += `
            <div class="cart-item">
                <b>${c.category}</b><br>
                Price: ${c.price}<br>
                <button onclick="removeFromCart(${i})">Remove</button>
            </div>`;
        });
        itemsBox.innerHTML = html;
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

/* CHECKOUT */
function checkout() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }
    let msg = "Hello UN ENTERPRISES, I want to enquire about:\n";
    cart.forEach(c => {
        msg += `- ${c.category} (${c.price})\n`;
    });
    window.open(
      "https://wa.me/916386319056?text=" + encodeURIComponent(msg),
      "_blank"
    );
}

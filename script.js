let cart = [];
let allProducts = [];

fetch("products.json")
.then(res => res.json())
.then(data => {
    allProducts = data;
    displayProducts(data);
});

function displayProducts(data) {
    let html = "";
    data.forEach(p => {
        html += `
        <div class="product-card">
            <img src="${p.image}">
            <h3>${p.category}</h3>
            <p><b>Price:</b> ${p.price}</p>
            <button onclick="addToCart(${p.id})">Add to Cart</button>
        </div>`;
    });
    document.getElementById("products").innerHTML = html;
}

function addToCart(id) {
    let product = allProducts.find(p => p.id === id);
    cart.push(product);
    document.getElementById("cartCount").innerText = cart.length;
    alert(product.category + " added to cart");
}

function openCart() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }

    let msg = "Hello UN ENTERPRISES, I want to enquire about:\n";
    cart.forEach(p => {
        msg += `- ${p.category} (${p.price})\n`;
    });

    window.open("https://wa.me/919889482011?text=" + encodeURIComponent(msg));
}
function searchProducts() {
    let val = document.getElementById("search").value.toLowerCase();
    let filtered = allProducts.filter(p =>
        p.category.toLowerCase().includes(val)
    );
    displayProducts(filtered);
}

function byId(id) {
  return document.getElementById(id);
}

function formatCurrency(amount) {
  return "₹" + amount.toFixed(2);
}

function refreshCartCount() {
  const cartCount = byId("cartCount");
  if (cartCount && window.cartStore) {
    cartCount.textContent = window.cartStore.getCartCount();
  }
}

function renderCart() {
  const cartItemsNode = byId("cartItems");
  const totalNode = byId("cartTotal");
  const cart = window.cartStore.getCart();

  if (!cart.length) {
    cartItemsNode.innerHTML = "<p>Your cart is empty.</p>";
    totalNode.textContent = formatCurrency(0);
    refreshCartCount();
    return;
  }

  cartItemsNode.innerHTML = cart.map(function (item) {
    return `
      <div class="cart-item">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" width="80" height="80">` : ""}
        <div>
          <h4>${item.name}</h4>
          <p>${item.price}</p>
          <div class="cart-actions">
            <button type="button" onclick="changeQty('${item.id}', -1)">-</button>
            <span>${item.qty}</span>
            <button type="button" onclick="changeQty('${item.id}', 1)">+</button>
            <button type="button" onclick="removeItem('${item.id}')">Remove</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  totalNode.textContent = formatCurrency(window.cartStore.getCartTotal());
  refreshCartCount();
}

window.changeQty = function (id, diff) {
  window.cartStore.updateItemQty(id, diff);
  renderCart();
};

window.removeItem = function (id) {
  window.cartStore.removeItem(id);
  renderCart();
};

function setupCheckoutButton() {
  const btn = byId("proceedCheckoutBtn");

  if (!btn) {
    return;
  }

  btn.addEventListener("click", function () {
    if (!window.cartStore.getCart().length) {
      alert("Your cart is empty.");
      return;
    }

    if (!window.auth) {
      window.location.href = "checkout.html";
      return;
    }

    const user = window.auth.currentUser;
    if (!user) {
      window.location.href = "login.html?redirect=" + encodeURIComponent("checkout.html");
      return;
    }

    window.location.href = "checkout.html";
  });
}

window.addEventListener("DOMContentLoaded", function () {
  renderCart();
  setupCheckoutButton();
});

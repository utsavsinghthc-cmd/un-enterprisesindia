function byId(id) {
  return document.getElementById(id);
}

function formatCurrency(amount) {
  return "₹" + amount.toFixed(2);
}

function renderSummary() {
  const cart = window.cartStore.getCart();
  const summary = byId("checkoutSummary");
  const totalNode = byId("checkoutTotal");

  if (!cart.length) {
    summary.innerHTML = "<p>Your cart is empty. Please add products first.</p>";
    totalNode.textContent = formatCurrency(0);
    return;
  }

  summary.innerHTML = cart.map(function (item) {
    return `<p>${item.name} × ${item.qty} <span>${item.price}</span></p>`;
  }).join("");

  totalNode.textContent = formatCurrency(window.cartStore.getCartTotal());
}

window.addEventListener("DOMContentLoaded", function () {
  renderSummary();

  const form = byId("checkoutForm");
  const message = byId("checkoutMessage");

  window.auth.onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = "login.html?redirect=checkout.html";
      return;
    }

    const navEmail = byId("navUserEmail");
    if (navEmail) {
      navEmail.textContent = user.email;
      navEmail.style.display = "inline";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const cartItems = window.cartStore.getCart();
      if (!cartItems.length) {
        message.textContent = "Cart is empty.";
        return;
      }

      const order = {
        name: byId("name").value.trim(),
        phone: byId("phone").value.trim(),
        address: byId("address").value.trim(),
        userEmail: user.email,
        userId: user.uid,
        items: cartItems,
        totalPrice: window.cartStore.getCartTotal(),
        status: "Pending",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      window.db.collection("orders").add(order)
        .then(function () {
          window.cartStore.clearCart();
          form.reset();
          renderSummary();
          message.textContent = "Order placed successfully!";
        })
        .catch(function (error) {
          message.textContent = "Failed to place order: " + error.message;
        });
    });
  });
});

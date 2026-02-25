(function () {
  const CART_KEY = "cart";
  const LEGACY_CART_KEY = "ue_cart_v1";

  function parsePrice(priceText) {
    const match = String(priceText || "0").replace(/,/g, "").match(/[\d.]+/);
    return match ? Number(match[0]) : 0;
  }
  
function readCartFromStorage() {
    const rawCart = localStorage.getItem(CART_KEY);
    if (rawCart) {
      return rawCart;
    }

    const legacyCart = localStorage.getItem(LEGACY_CART_KEY);
    if (legacyCart) {
      localStorage.setItem(CART_KEY, legacyCart);
      localStorage.removeItem(LEGACY_CART_KEY);
      return legacyCart;
    }

    return null;
  }

  function getCart() {
    try {
      const raw = readCartFromStorage();
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.error("Failed to parse cart", error);
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart || []));
  }

  function getCartCount() {
    return getCart().reduce(function (count, item) {
      return count + (item.qty || 0);
    }, 0);
  }

  function addItem(product) {
    const cart = getCart();
    const existing = cart.find(function (item) {
      return item.id === product.id;
    });

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image || "",
        qty: 1
      });
    }

    saveCart(cart);
    return cart;
  }

  function updateItemQty(id, diff) {
    const cart = getCart();
    const item = cart.find(function (entry) {
      return entry.id === id;
    });

    if (!item) return cart;

    item.qty += diff;

    const updated = cart.filter(function (entry) {
      return entry.qty > 0;
    });

    saveCart(updated);
    return updated;
  }

  function removeItem(id) {
    const updated = getCart().filter(function (item) {
      return item.id !== id;
    });

    saveCart(updated);
    return updated;
  }

  function clearCart() {
    saveCart([]);
  }

  function getCartTotal() {
    return getCart().reduce(function (sum, item) {
      return sum + parsePrice(item.price) * item.qty;
    }, 0);
  }

  window.cartStore = {
    parsePrice: parsePrice,
    getCart: getCart,
    saveCart: saveCart,
    getCartCount: getCartCount,
    addItem: addItem,
    updateItemQty: updateItemQty,
    removeItem: removeItem,
    clearCart: clearCart,
    getCartTotal: getCartTotal,
    storageKey: CART_KEY
  };
})();

(function () {
  function byId(id) {
    return document.getElementById(id);
  }

  function getRedirectUrl(defaultUrl) {
    const params = new URLSearchParams(window.location.search);
    return params.get("redirect") || defaultUrl;
  }

  function updateNavbar(user) {
    const emailNode = byId("navUserEmail");
    const authBtn = byId("authActionBtn");

    if (emailNode) {
      emailNode.textContent = user ? user.email : "";
      emailNode.style.display = user ? "inline" : "none";
    }

    if (!authBtn) {
      return;
    }

    if (user) {
      authBtn.textContent = "Logout";
      authBtn.href = "#";
      authBtn.onclick = function (event) {
        event.preventDefault();
        window.auth.signOut();
      };
    } else {
      const currentPath = window.location.pathname.split("/").pop() || "index.html";
      authBtn.textContent = "Login";
      authBtn.href = "login.html?redirect=" + encodeURIComponent(currentPath);
      authBtn.onclick = null;
    }
  }

  function bindAuthPages() {
    const loginForm = byId("loginForm");
    const registerForm = byId("registerForm");

    if (loginForm) {
      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = byId("email").value.trim();
        const password = byId("password").value;
        const errorNode = byId("authError");

        errorNode.textContent = "";

        window.auth.signInWithEmailAndPassword(email, password)
          .then(function () {
            window.location.href = getRedirectUrl("index.html");
          })
          .catch(function (error) {
            errorNode.textContent = error.message;
          });
      });
    }

    if (registerForm) {
      registerForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const email = byId("email").value.trim();
        const password = byId("password").value;
        const confirmPassword = byId("confirmPassword").value;
        const errorNode = byId("authError");

        errorNode.textContent = "";

        if (password !== confirmPassword) {
          errorNode.textContent = "Passwords do not match.";
          return;
        }

        window.auth.createUserWithEmailAndPassword(email, password)
          .then(function () {
            window.location.href = "index.html";
          })
          .catch(function (error) {
            errorNode.textContent = error.message;
          });
      });
    }
  }

  window.addEventListener("DOMContentLoaded", function () {
    if (!window.auth) {
      return;
    }

    bindAuthPages();

    window.auth.onAuthStateChanged(function (user) {
      updateNavbar(user);
    });
  });
})();

fetch("products.json")
.then(r => r.json())
.then(data => {
  let out = "";
  data.forEach(p => {
    out += `
      <div class="product-card">
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
      </div>`;
  });
  document.getElementById("products").innerHTML = out;
});

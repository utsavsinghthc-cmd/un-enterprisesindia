fetch("products.json")
.then(res => res.json())
.then(data => {
    let html = "";
    data.forEach(cat => {
        html += `
        <div class="product-card">
            <img src="${cat.image}">
            <h3>${cat.category}</h3>
            <ul>`;
        cat.items.forEach(item => {
            html += `<li>${item}</li>`;
        });
        html += `
            </ul>
            <a href="https://wa.me/919889482011?text=Hello%20UN%20ENTERPRISES,%20I%20want%20details%20about%20${encodeURIComponent(cat.category)}"
               target="_blank">Enquire on WhatsApp</a>
        </div>`;
    });
    document.getElementById("products").innerHTML = html;
});

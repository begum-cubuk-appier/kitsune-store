// 1. Data: Our Kitsune Items
const products = [
    { id: 1, name: "Fox Mask", price: 25, img: "🎭", category: "Apparel" },
    { id: 2, name: "Zenko Statue", price: 45, img: "🗿", category: "Decor" },
    { id: 3, name: "Kitsune Plush", price: 20, img: "🦊", category: "Toys" }
];

let cart = [];

// 2. Router: Switches views based on the URL Hash
const navigate = () => {
    const path = window.location.hash.replace('#', '');
    const app = document.getElementById('app');

    if (!path || path === 'home') renderHome(app);
    else if (path === 'category') renderCategory(app);
    else if (path.startsWith('product/')) renderProduct(app, path.split('/')[1]);
    else if (path === 'cart') renderCart(app);
    else if (path === 'checkout') renderCheckout(app);
    else if (path === 'success') renderSuccess(app);
    else if (path === 'login') renderLogin(app);
};

// 3. Page Renderers
function renderHome(container) {
    container.innerHTML = `
        <section class="hero">
            <h2>Welcome to the Spirit Realm</h2>
            <button onclick="window.location.hash = 'category'">View All Kitsune Items</button>
        </section>
    `;
}

function renderCategory(container) {
    let html = '<h2>Our Collection</h2><div class="grid">';
    products.forEach(p => {
        html += `
            <div class="card">
                <span>${p.img}</span>
                <h3>${p.name}</h3>
                <p>$${p.price}</p>
                <button onclick="window.location.hash = 'product/${p.id}'">Go to Product</button>
            </div>`;
    });
    container.innerHTML = html + '</div>';
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/kitsune-store/qg-sw.d73668db67f33dcc40a7.js', {
      scope: '/kitsune-store/'
    })
    .then(reg => console.log('Service Worker Registered!', reg))
    .catch(err => console.log('Registration failed:', err));
  }

function renderProduct(container, id) {
    const item = products.find(p => p.id == id);
    container.innerHTML = `
        <div class="product-detail">
            <span>${item.img}</span>
            <h2>${item.name}</h2>
            <p>A beautiful ${item.name} for your collection.</p>
            <p><strong>$${item.price}</strong></p>
            <button onclick="addToCart(${item.id})">Add to Cart</button>
            <button onclick="window.location.hash = 'category'">Back</button>
        </div>
    `;
}

function renderCart(container) {
    let html = '<h2>Your Cart</h2>';
    if (cart.length === 0) {
        html += '<p>Empty as a hollow log.</p>';
    } else {
        cart.forEach(item => {
            html += `
                <div class="cart-item">
                    <span>${item.name} - $${item.price} (Qty: ${item.quantity})</span>
                    <button onclick="updateQty(${item.id}, 1)">+</button>
                    <button onclick="updateQty(${item.id}, -1)">-</button>
                    <button onclick="removeFromCart(${item.id})">Remove</button>
                </div>`;
        });
        html += `<button onclick="window.location.hash = 'checkout'">Go to Checkout</button>`;
    }
    container.innerHTML = html;
}

function renderCheckout(container) {
    container.innerHTML = `
        <h2>Checkout</h2>
        <p>Select Payment Method:</p>
        <select><option>Inari Spirit Points</option><option>Credit Card</option></select>
        <br><br>
        <button onclick="completePurchase()">Complete Purchase</button>
    `;
}

function renderSuccess(container) {
    container.innerHTML = `<h2>Success!</h2><p>Your items are being delivered by fox-fire.</p><button onclick="window.location.hash = ''">Back Home</button>`;
}

function renderLogin(container) {
    container.innerHTML = `<h2>Login</h2><input type="text" placeholder="Username"><button onclick="window.location.hash = ''">Login</button>`;
}

// 4. Cart Logic
function addToCart(id) {
    const item = products.find(p => p.id === id);
    const inCart = cart.find(c => c.id === id);
    if (inCart) inCart.quantity++;
    else cart.push({...item, quantity: 1});
    updateUI();
    alert("Added to cart!");
}

function updateQty(id, change) {
    const item = cart.find(c => c.id === id);
    item.quantity += change;
    if (item.quantity <= 0) removeFromCart(id);
    updateUI();
    renderCart(document.getElementById('app'));
}

function removeFromCart(id) {
    cart = cart.filter(c => c.id !== id);
    updateUI();
    renderCart(document.getElementById('app'));
}

function completePurchase() {
    cart = [];
    updateUI();
    window.location.hash = 'success';
}

function updateUI() {
    document.getElementById('cart-count').innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
}

// Listen for hash changes
window.addEventListener('hashchange', navigate);
window.addEventListener('load', navigate);
// --- Global Tracking Configurations ---
const ORDER_CURRENCY = 'USD';
const SHIPPING_FEE = 10;
const PROFILE_STORAGE_KEY = 'kitsune_user_profile';

// Your original testing items
const products = [
    { id: 1, name: "Fox Mask", price: 25, img: "🎭" },
    { id: 2, name: "Zenko Statue", price: 45, img: "🗿" },
    { id: 3, name: "Kitsune Plush", price: 20, img: "🦊" }
];

let cart = [];

// --- 1. Demographic & Tracking Core Architecture (From Reference Structure) ---

function calculateAge(birthday) {
    const birth = new Date(birthday + 'T00:00:00');
    if (Number.isNaN(birth.getTime())) return null;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age -= 1;
    }
    return age >= 0 ? age : null;
}

function saveUserProfile(birthday) {
    const age = calculateAge(birthday);
    if (age === null) return null;

    const profile = {
        birthday: String(birthday),
        age: Number(age)
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    return profile;
}

function identifyUser(profile) {
    if (!profile) return;

    const payload = {
        birthday: String(profile.birthday),
        age: Number(profile.age)
    };

    if (typeof window.qg === 'function') {
        window.qg('identify', payload);
    }
    if (window.woopra && typeof window.woopra.identify === 'function') {
        window.woopra.identify(payload);
    }
}

function fireAppierEvent(eventName, payload) {
    if (typeof window.qg === 'function') {
        window.qg('event', eventName, payload);
    }
    if (window.woopra && typeof window.woopra.track === 'function') {
        window.woopra.track(eventName, payload);
    }
}

// --- 2. Single Page App Navigation Router ---

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

// --- 3. Pure Interface Layout Component Compilers ---

// HOME PAGE: Restored original hero banner and direct product item layout
function renderHome(container) {
    let html = `
        <section class="hero" style="text-align: center; margin-bottom: 30px;">
            <h2>Welcome to the Spirit Realm</h2>
            <button onclick="window.location.hash = 'category'">View All Kitsune Items</button>
        </section>
        <h2>Featured Products</h2>
        <div class="grid">`;
        
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

// CATEGORY PAGE: Standard list display
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
        cart.forEach((item, index) => {
            html += `
                <div class="cart-item">
                    <span>${item.name} - $${item.price} (Qty: ${item.quantity})</span>
                    <button onclick="updateQty(${index}, 1)">+</button>
                    <button onclick="updateQty(${index}, -1)">-</button>
                    <button onclick="removeFromCart(${index})">Remove</button>
                </div>`;
        });
        html += `<button onclick="window.location.hash = 'checkout'">Go to Checkout</button>`;
    }
    container.innerHTML = html;
}

function renderCheckout(container) {
    const cachedProfile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)) || { birthday: '' };
    container.innerHTML = `
        <h2>Checkout</h2>
        <div style="margin-bottom: 20px;">
            <label style="display:block; font-size:12px; margin-bottom:5px;">Birthday Attributes Tracking:</label>
            <input type="date" id="checkout-birthday" value="${cachedProfile.birthday}" style="padding:8px; color:black;">
        </div>
        <p>Select Payment Method:</p>
        <select><option>Inari Spirit Points</option><option>Credit Card</option></select>
        <br><br>
        <button onclick="completePurchase()">Complete Purchase</button>
    `;
}

function renderSuccess(container) {
    container.innerHTML = `
        <h2>Success!</h2>
        <p>Your items are being delivered by fox-fire.</p>
        <button onclick="window.location.hash = ''">Back Home</button>
    `;
    trackOrderConfirmation();
}

// LOGIN PAGE: Correctly placed birthday picker form elements here
function renderLogin(container) {
    const cachedProfile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)) || { birthday: '' };
    container.innerHTML = `
        <h2>Identity Logging</h2>
        <div style="margin-bottom: 15px;">
            <label style="display:block; font-size:12px; margin-bottom:5px;">Enter Birthday Attribute:</label>
            <input type="date" id="login-birthday" value="${cachedProfile.birthday}" style="color:black; padding:8px;">
        </div>
        <button onclick="processLogin()">Login & Identify Attributes</button>
    `;
}

// --- 4. Interactive Functional Life-cycles ---

function addToCart(id) {
    const item = products.find(p => p.id === id);
    const inCart = cart.find(c => c.id === id);
    if (inCart) {
        inCart.quantity++;
    } else {
        cart.push({...item, quantity: 1});
    }
    updateUI();

    if (typeof window.qg === "function") {
        window.qg('event', 'add_to_cart', {
            item_name: item.name,
            price: item.price,
            size: 'Universal'
        });
    }
    alert("Added to cart!");
}

function updateQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateUI();
    renderCart(document.getElementById('app'));
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateUI();
    renderCart(document.getElementById('app'));
}

function processLogin() {
    const bdayInput = document.getElementById('login-birthday').value;
    if (!bdayInput) return alert('Select your birthday.');
    
    const profile = saveUserProfile(bdayInput);
    if (profile) {
        identifyUser(profile);
        alert('User profile identity mapped into tracker parameters!');
        window.location.hash = '';
    }
}

function completePurchase() {
    if (cart.length === 0) return alert("Your cart is empty!");

    const bdayInput = document.getElementById('checkout-birthday').value;
    if (!bdayInput) return alert('Please enter your birthday before checkout.');

    const profile = saveUserProfile(bdayInput);
    if (!profile) return alert('Please enter a valid birthday.');

    identifyUser(profile);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderAmount = Number(subtotal) + Number(SHIPPING_FEE);
    const generatedOrderId = "KITSUNE_ORD_" + Date.now();

    sessionStorage.setItem('kitsune_last_order', JSON.stringify({
        order_id: generatedOrderId,
        order_amount: orderAmount,
        currency: ORDER_CURRENCY,
        shipping_fee: Number(SHIPPING_FEE),
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity)
        }))
    }));

    cart = [];
    updateUI();
    window.location.hash = 'success';
}

function trackOrderConfirmation() {
    const raw = sessionStorage.getItem('kitsune_last_order');
    if (!raw) return;

    let order;
    try { order = JSON.parse(raw); } catch { return; }
    if (order.tracked) return;

    const checkoutPayload = {
        order_id: String(order.order_id),
        order_amount: Number(order.order_amount),
        currency: String(order.currency),
        shipping_fee: Number(order.shipping_fee)
    };

    fireAppierEvent('checkout_completed', checkoutPayload);

    (order.items || []).forEach(item => {
        const productPayload = {
            product_id: 'KIT_SKU_' + item.id,
            product_name: String(item.name),
            product_price: Number(item.price),
            quantity: Number(item.quantity)
        };
        fireAppierEvent('product_purchased', productPayload);
    });

    order.tracked = true;
    sessionStorage.setItem('kitsune_last_order', JSON.stringify(order));
}

function updateUI() {
    document.getElementById('cart-count').innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
}

// --- 5. Event Registrars ---
window.addEventListener('hashchange', navigate);
window.addEventListener('load', () => {
    navigate();
    const profile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY));
    if (profile) identifyUser(profile);
});

// --- Configurations & State ---
const ORDER_CURRENCY = 'USD'; //
const SHIPPING_FEE = 10; //
const PROFILE_STORAGE_KEY = 'kitsune_user_profile';

const products = [
    { id: 1, name: "Traditional Fox Mask", category: "Apparel", price: 89, img: "🎭" },
    { id: 2, name: "Sacred Zenko Statue", category: "Decor", price: 150, img: "🗿" },
    { id: 3, name: "Inari Spirit Plush", category: "Toys", price: 45, img: "🦊" },
    { id: 4, name: "Nine-Tails Silk Kimono", category: "Apparel", price: 299, img: "🥋" }
];

let cart = JSON.parse(localStorage.getItem('kitsune_cart')) || [];

// --- Profile & Demographic Calculus Engine --- //
function calculateAge(birthday) { //
    const birth = new Date(birthday + 'T00:00:00'); //
    if (Number.isNaN(birth.getTime())) return null; //

    const today = new Date(); //
    let age = today.getFullYear() - birth.getFullYear(); //
    const monthDiff = today.getMonth() - birth.getMonth(); //
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) { //
        age -= 1; //
    }
    return age >= 0 ? age : null; //
}

function saveUserProfile(birthday) { //
    const age = calculateAge(birthday); //
    if (age === null) return null; //

    const profile = { birthday: String(birthday), age: Number(age) }; //
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile)); //
    return profile; //
}

// --- Tracking Integration (AIRIS/AIQUA & Woopra) --- //
function identifyUser() { //
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return;
    const profile = JSON.parse(raw);

    const payload = { birthday: String(profile.birthday), age: Number(profile.age) }; //

    if (typeof window.qg === 'function') { //
        window.qg('identify', payload); //
    }
    if (window.woopra && typeof window.woopra.identify === 'function') { //
        window.woopra.identify(payload); //
    }
}

function fireAppierEvent(eventName, payload) { //
    if (typeof window.qg === 'function') { //
        window.qg('event', eventName, payload); //
    }
    if (window.woopra && typeof window.woopra.track === 'function') { //
        window.woopra.track(eventName, payload); //
    }
}

// --- SPA Render Router Engines ---
const app = document.getElementById('app');

function updateNavCartCount() {
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
    }
}

function handleHashRouting() {
    const hash = window.location.hash.replace('#', '') || 'home';
    updateNavCartCount();

    if (hash === 'home') renderHomePage();
    else if (hash === 'category') renderCategoryPage();
    else if (hash.startsWith('product/')) renderProductPage(hash.split('/')[1]);
    else if (hash === 'cart') renderCartPage();
    else if (hash === 'checkout') renderCheckoutPage();
    else if (hash === 'success') renderSuccessPage();
}

// --- UI View Compilation ---
function renderHomePage() {
    const profile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)) || { birthday: '', age: '' };
    app.innerHTML = `
        <div class="text-center my-12">
            <h2 class="text-6xl font-black mb-4 italic tracking-tighter">SPIRIT REALM</h2>
            <p class="text-zinc-500 tracking-widest uppercase text-xs">Premium Kitsune Apparel & Artifacts</p>
        </div>
        <div class="max-w-md mx-auto mb-12 bg-zinc-900 border border-zinc-800 p-8">
            <h3 class="text-sm font-bold mb-6 text-zinc-400 tracking-widest uppercase text-center">User Attributes</h3>
            <div class="space-y-4">
                <label class="block text-xs uppercase tracking-widest text-zinc-500">Birthday</label>
                <input type="date" id="profile-birthday" value="${profile.birthday}" class="w-full bg-black border border-zinc-800 p-3 outline-none text-white focus:border-white">
                <label class="block text-xs uppercase tracking-widest text-zinc-500">Calculated Age</label>
                <input type="text" id="profile-age" readonly value="${profile.age}" placeholder="Aiqua Engine Compute" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-400">
                <button onclick="executeProfileSave()" class="w-full bg-red-600 text-white py-3 font-black uppercase text-sm hover:bg-red-700 transition">Save Profile Attributes</button>
            </div>
        </div>
        <div class="text-center"><button onclick="window.location.hash='category'" class="bg-white text-black font-bold px-8 py-3 uppercase tracking-wider hover:bg-zinc-200">Enter Collection</button></div>
    `;

    document.getElementById('profile-birthday').addEventListener('input', () => {
        const age = calculateAge(document.getElementById('profile-birthday').value);
        document.getElementById('profile-age').value = age !== null ? age : '';
    });
}

function executeProfileSave() {
    const bday = document.getElementById('profile-birthday').value;
    if (!bday) return alert("Select birthday first.");
    const profile = saveUserProfile(bday); //
    if (profile) {
        identifyUser(); //
        alert("Attributes Synced into AIQUA Profiles!");
    }
}

function renderCategoryPage() {
    let html = `<h2 class="text-3xl font-black mb-8 italic uppercase border-l-4 border-red-500 pl-4">KITSUNE MERCHANDISE</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">`;
    products.forEach(p => {
        html += `
            <div class="border border-zinc-800 p-6 bg-zinc-900 flex flex-col items-center group hover:border-white transition">
                <div class="text-6xl my-4">${p.img}</div>
                <h4 class="font-bold tracking-widest uppercase text-sm mb-1">${p.name}</h4>
                <p class="text-zinc-400 font-mono text-sm mb-4">$${p.price}</p>
                <button onclick="window.location.hash='product/${p.id}'" class="w-full py-2 bg-white text-black font-bold text-xs uppercase hover:bg-zinc-200">Go To Product</button>
            </div>`;
    });
    app.innerHTML = html + `</div>`;
}

let activeProduct = null;
function renderProductPage(id) {
    activeProduct = products.find(p => p.id == id);
    if (!activeProduct) return;
    app.innerHTML = `
        <button onclick="window.location.hash='category'" class="mb-8 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition">← Back to Collection</button>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div class="bg-zinc-900 border border-zinc-800 p-16 text-center text-9xl">${activeProduct.img}</div>
            <div>
                <h2 class="text-4xl font-black mb-2 uppercase">${activeProduct.name}</h2>
                <p class="text-xl mb-6 text-red-500 font-mono font-bold">$${activeProduct.price}</p>
                <div class="mb-8">
                    <label class="block text-xs font-bold uppercase tracking-widest mb-2">Quantity</label>
                    <input type="number" id="item-qty" value="1" min="1" class="bg-black border border-zinc-800 p-2 w-24 outline-none focus:border-white text-white">
                </div>
                <button onclick="executeAddToCart()" class="bg-white text-black px-12 py-4 font-black hover:bg-zinc-200 w-full transition">ADD TO CART</button>
            </div>
        </div>`;
}

function executeAddToCart() {
    const qty = parseInt(document.getElementById('item-qty').value) || 1;
    const existingIndex = cart.findIndex(item => item.id === activeProduct.id);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += qty;
    } else {
        cart.push({ ...activeProduct, quantity: qty });
    }
    
    localStorage.setItem('kitsune_cart', JSON.stringify(cart));

    // Fire add_to_cart tracking event
    fireAppierEvent('add_to_cart', {
        item_name: activeProduct.name,
        price: Number(activeProduct.price),
        quantity: Number(qty)
    });

    window.location.hash = 'cart';
}

function renderCartPage() {
    if (cart.length === 0) {
        app.innerHTML = `<h2 class="text-4xl font-black mb-6 italic">YOUR CART</h2><p class="text-zinc-600 italic mb-6">Bag is empty.</p><button onclick="window.location.hash='category'" class="bg-white text-black px-6 py-2 font-bold text-sm uppercase">Shop Items</button>`;
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    let html = `<h2 class="text-4xl font-black mb-10 italic">YOUR ORDER</h2><div class="space-y-4 mb-8">`;
    cart.forEach((item, index) => {
        html += `
            <div class="flex justify-between items-center py-4 border-b border-zinc-900 bg-zinc-900/50 p-4 border border-zinc-800">
                <div>
                    <span class="font-bold uppercase text-sm">${item.name}</span>
                    <p class="text-xs text-zinc-500">Qty: ${item.quantity} | Unit: $${item.price}</p>
                </div>
                <div class="flex items-center gap-4">
                    <button onclick="modifyQty(${index}, 1)" class="bg-zinc-800 px-2 rounded hover:bg-white hover:text-black font-bold">+</button>
                    <button onclick="modifyQty(${index}, -1)" class="bg-zinc-800 px-2 rounded hover:bg-white hover:text-black font-bold">-</button>
                    <span class="font-mono text-sm font-bold">$${item.price * item.quantity}</span>
                    <button onclick="removeCartItem(${index})" class="text-zinc-500 hover:text-red-500 text-xs uppercase font-bold ml-4">Remove</button>
                </div>
            </div>`;
    });

    html += `</div>
        <div class="border-t border-zinc-800 pt-4 mb-8 flex justify-between items-center">
            <span class="text-xl font-bold tracking-widest text-zinc-400">TOTAL</span>
            <span class="text-2xl font-mono font-black text-white">$${subtotal}</span>
        </div>
        <div class="text-right"><button onclick="window.location.hash='checkout'" class="bg-red-600 text-white font-black px-12 py-4 uppercase hover:bg-red-700 transition">Go To Checkout</button></div>`;
    app.innerHTML = html;
}

function modifyQty(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    localStorage.setItem('kitsune_cart', JSON.stringify(cart));
    renderCartPage();
    updateNavCartCount();
}

function removeCartItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('kitsune_cart', JSON.stringify(cart));
    renderCartPage();
    updateNavCartCount();
}

function renderCheckoutPage() {
    const profile = JSON.parse(localStorage.getItem(PROFILE_STORAGE_KEY)) || { birthday: '', age: '' };
    app.innerHTML = `
        <h2 class="text-4xl font-black mb-10 italic">CHECKOUT</h2>
        <div class="bg-zinc-900 p-8 border border-zinc-800 max-w-xl mx-auto">
            <h3 class="text-sm font-bold mb-6 text-zinc-400 tracking-widest uppercase">Verify Demographics</h3>
            <div class="space-y-4 mb-8">
                <label class="block text-xs uppercase tracking-widest text-zinc-500">Birthday</label>
                <input type="date" id="checkout-birthday" value="${profile.birthday}" class="w-full bg-black border border-zinc-800 p-3 text-white">
                <label class="block text-xs uppercase tracking-widest text-zinc-500">Calculated Age</label>
                <input type="text" id="checkout-age" readonly value="${profile.age}" class="w-full bg-zinc-950 border border-zinc-800 p-3 text-zinc-400">
            </div>
            <h3 class="text-sm font-bold mb-6 text-zinc-400 tracking-widest uppercase">Select Payment Framework</h3>
            <select class="w-full bg-black border border-zinc-800 p-3 mb-8 text-sm outline-none focus:border-white">
                <option>Inari Mystic Realm Points (No Input Required)</option>
                <option>Mock Testing Card</option>
            </select>
            <button onclick="processPurchase()" class="w-full bg-white text-black py-4 font-black hover:bg-zinc-200 uppercase transition">Complete Purchase</button>
        </div>`;
}

function processPurchase() {
    if (cart.length === 0) return alert("Cart is empty.");
    
    const birthdayVal = document.getElementById('checkout-birthday').value;
    if (!birthdayVal) return alert("Please submit your birthday parameter to close checkout.");

    // Sync demographics on closure
    const updatedProfile = saveUserProfile(birthdayVal); //
    if (!updatedProfile) return alert("Invalid demographic payload parameters.");
    identifyUser(); //

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderAmount = Number(subtotal) + Number(SHIPPING_FEE); //
    const generatedOrderId = "KITSUNE_ORD_" + Date.now(); //

    // Save order payload parameters in sessionStorage for receipt parsing
    sessionStorage.setItem('kitsune_last_order', JSON.stringify({
        order_id: generatedOrderId,
        order_amount: orderAmount,
        currency: ORDER_CURRENCY, //
        shipping_fee: Number(SHIPPING_FEE), //
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: Number(item.quantity)
        }))
    }));

    // Reset localized variables
    cart = [];
    localStorage.removeItem('kitsune_cart');
    window.location.hash = 'success';
}

function renderSuccessPage() {
    app.innerHTML = `
        <div class="text-center py-20">
            <div class="inline-block border-2 border-red-500 rounded-full p-4 mb-6 text-red-500 text-3xl font-black">✓</div>
            <h2 class="text-5xl font-black mb-4 italic">PURCHASE COMPLETED</h2>
            <p class="text-zinc-500 mb-12">Your order has been safely parsed into AIRIS & AIQUA analytics nodes.</p>
            <a href="#home" class="text-sm font-bold uppercase border-b-2 border-white pb-1 hover:text-red-500 transition">Return to Shrine Home</a>
        </div>`;
    
    // Fire analytical tracking triggers immediately upon receipt view compilation
    trackOrderConfirmation();
}

function trackOrderConfirmation() { //
    identifyUser(); //
    const raw = sessionStorage.getItem('kitsune_last_order'); //
    if (!raw) return; //

    let order;
    try { order = JSON.parse(raw); } catch { return; } //
    if (order.tracked) return; //

    // 1. Fire Transactional Metadata Event
    fireAppierEvent('checkout_completed', { //
        order_id: String(order.order_id), //
        order_amount: Number(order.order_amount), //
        currency: String(order.currency), //
        shipping_fee: Number(order.shipping_fee) //
    });

    // 2. Loop and Fire Itemized Product Events
    (order.items || []).forEach(item => { //
        fireAppierEvent('product_purchased', { //
            product_id: 'KIT_SKU_' + item.id, //
            product_name: String(item.name), //
            product_price: Number(item.price), //
            quantity: Number(item.quantity) //
        });
    });

    order.tracked = true; //
    sessionStorage.setItem('kitsune_last_order', JSON.stringify(order)); //
}

// --- Event Registrars ---
window.addEventListener('hashchange', handleHashRouting);
window.addEventListener('load', () => {
    handleHashRouting();
    identifyUser(); // Auto-identify returning visitors with cached profiles
});

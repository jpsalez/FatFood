import { isLoggedIn, getUserId } from './token.js';

function getCartKey() {
    const userId = getUserId();
    return userId ? `cart_${userId}` : null;
}

function loadCart() {
    const key = getCartKey();
    return key ? JSON.parse(localStorage.getItem(key) || '[]') : [];
}

function saveCart() {
    const key = getCartKey();
    if (key) localStorage.setItem(key, JSON.stringify(cart));
}

let cart = loadCart();

export function initCart() {
    cart = loadCart();
    updateCartBadge();
}

export function addToCart(product) {
    if (!isLoggedIn()) {
        window.showToast?.('Faça login para adicionar itens ao carrinho.', 'info');
        window.showSection('login');
        return;
    }

    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    }

    saveCart();
    updateCartBadge();
    showToast(`${product.name} adicionado ao carrinho!`, 'success');
}

export function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) badge.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

export function renderCart() {
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-center py-5 text-muted">Seu carrinho está vazio.</p>';
        if (totalElement) totalElement.textContent = 'R$ 0,00';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
            <div>
                <h6 class="fw-bold mb-0">${item.name}</h6>
                <small class="text-muted">${item.quantity}x R$ ${item.price.toFixed(2)}</small>
            </div>
            <div class="d-flex align-items-center">
                <button class="btn btn-sm btn-outline-secondary px-2" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="mx-2">${item.quantity}</span>
                <button class="btn btn-sm btn-outline-secondary px-2" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="btn btn-sm text-danger ms-3" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    if (totalElement) totalElement.textContent = `R$ ${total.toFixed(2)}`;
}

window.updateQuantity = (id, change) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(id);
    } else {
        saveCart();
        updateCartBadge();
        renderCart();
    }
};

window.removeFromCart = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    updateCartBadge();
    renderCart();
};

export function clearCart() {
    cart = [];
    saveCart();
    updateCartBadge();
}

export function getCartItems() {
    return cart;
}

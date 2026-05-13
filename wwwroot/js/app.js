import { initAuth, logout as authLogout } from './modules/auth.js';
import { loadProducts } from './modules/product.js';
import { initCart, renderCart } from './modules/cart.js';
import { createOrder, loadOrders } from './modules/order.js';
import { initDashboard } from './modules/dashboard.js';
import { isAdmin, isLoggedIn } from './modules/token.js';

const appContent = document.getElementById('app-content');
const modalsContainer = document.getElementById('modals-container');

document.addEventListener('DOMContentLoaded', async () => {
    await loadModals();
    initAuth();
    initCart();
    showSection('home');
});

document.addEventListener('sectionLoaded', (e) => {
    const handlers = {
        home: checkAdminAccess,
        menu: loadProducts,
        orders: loadOrders,
        dashboard: initDashboard,
        login: initAuth,
        register: initAuth,
    };
    handlers[e.detail]?.();
});

function checkAdminAccess() {
    const visible = isAdmin();
    document.getElementById('admin-nav-link')?.classList.toggle('d-none', !visible);
    document.getElementById('admin-home-btn')?.classList.toggle('d-none', !visible);
}

async function loadModals() {
    try {
        const [authHtml, cartHtml] = await Promise.all([
            fetch('pages/auth.html').then(res => res.text()),
            fetch('pages/cart.html').then(res => res.text())
        ]);
        modalsContainer.innerHTML = authHtml + cartHtml;

        document.getElementById('cartModal')?.addEventListener('show.bs.modal', renderCart);
    } catch (error) {
        console.error('Erro ao carregar modais:', error);
    }
}

async function showSection(sectionName) {
    const adminOnly = ['admin', 'dashboard', 'product-management'];
    if (adminOnly.includes(sectionName) && !isAdmin()) {
        showToast('Área restrita: acesso negado.', 'error');
        showSection('home');
        return;
    }

    const loginRequired = ['orders', 'payment'];
    if (loginRequired.includes(sectionName) && !isLoggedIn()) {
        showToast('Faça login para continuar.', 'info');
        showSection('login');
        return;
    }

    try {
        const response = await fetch(`pages/${sectionName}.html`, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`Página ${sectionName} não encontrada`);

        appContent.innerHTML = await response.text();

        const navbarCollapse = document.getElementById('navbarNav');
        if (navbarCollapse?.classList.contains('show')) {
            (bootstrap.Collapse.getInstance(navbarCollapse) ?? new bootstrap.Collapse(navbarCollapse)).hide();
        }

        window.scrollTo(0, 0);
        document.dispatchEvent(new CustomEvent('sectionLoaded', { detail: sectionName }));
    } catch (error) {
        console.error('Erro ao carregar seção:', error);
        appContent.innerHTML = `<div class="container py-5 text-center"><h2>Erro ao carregar página</h2><p>${error.message}</p></div>`;
    }
}

window.showSection = showSection;
window.logout = authLogout;

window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `ff-toast ff-toast-${type}`;
    toast.innerHTML = `<span class="ff-toast-icon">${icons[type] ?? icons.info}</span><span>${message}</span>`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('ff-toast-show'));
    setTimeout(() => {
        toast.classList.remove('ff-toast-show');
        toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, 3200);
};

window.openCart = () => {
    if (!isLoggedIn()) {
        showCartAuthPrompt();
        return;
    }
    const cartEl = document.getElementById('cartModal');
    if (cartEl) (bootstrap.Modal.getInstance(cartEl) ?? new bootstrap.Modal(cartEl)).show();
};

function showCartAuthPrompt() {
    document.getElementById('cart-auth-prompt')?.remove();

    const overlay = document.createElement('div');
    overlay.id        = 'cart-auth-prompt';
    overlay.className = 'cap-overlay';
    overlay.innerHTML = `
<div class="cap" role="dialog" aria-modal="true" aria-labelledby="cap-title">
  <div class="cap__icon-wrap" aria-hidden="true">
    <span class="cap__icon">🛍️</span>
  </div>

  <div class="cap__body">
    <h2 class="cap__title" id="cap-title">Faça login para continuar</h2>
    <p class="cap__sub">Acesse sua conta para visualizar o carrinho e finalizar seu pedido.</p>
  </div>

  <div class="cap__actions">
    <button class="cap__btn cap__btn--primary" id="cap-confirm">
      Entrar agora
      <span class="cap__arrow" aria-hidden="true">→</span>
    </button>
    <button class="cap__btn cap__btn--ghost" id="cap-cancel">Cancelar</button>
  </div>
</div>`;

    const close = () => {
        overlay.classList.remove('cap-overlay--open');
        overlay.addEventListener('transitionend', () => {
            overlay.remove();
            document.body.style.overflow = '';
        }, { once: true });
    };

    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    overlay.querySelector('#cap-cancel').addEventListener('click', close);
    overlay.querySelector('#cap-confirm').addEventListener('click', () => {
        close();
        setTimeout(() => showSection('login'), 220);
    });

    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', escHandler); }
    });

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('cap-overlay--open')));
}

window.checkout = () => {
    if (!isLoggedIn()) {
        showToast('Faça login para finalizar seu pedido.', 'info');
        showSection('login');
        return;
    }
    createOrder();
};

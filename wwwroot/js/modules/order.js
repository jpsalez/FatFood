import { getCartItems, clearCart } from './cart.js';
import { getUserId, isLoggedIn, apiFetch } from './token.js';
import { escHtml as esc, STATUS, FLOW, FLOW_LABELS, productEmoji as emoji } from './utils.js';

const API_URL    = 'v1/api/orders';
const MY_API_URL = 'v1/api/orders/my';

let currentOrder = null;
let ordersCache  = [];

// ── Create order ───────────────────────────────────────────────────────
export async function createOrder() {
    const userId = getUserId();
    const items  = getCartItems();

    if (!userId) { window.showToast?.('Faça login para continuar.', 'error'); return; }
    if (!items.length) { window.showToast?.('Seu carrinho está vazio!', 'info'); return; }

    const payload = {
        userId: parseInt(userId),
        totalPrice: items.reduce((s, i) => s + i.price * i.quantity, 0),
        items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
    };

    try {
        const res    = await apiFetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const result = await res.json();
        if (res.ok) {
            currentOrder = result.data;
            clearCart();
            bootstrap.Modal.getInstance(document.getElementById('cartModal'))?.hide();
            window.showSection('payment');
            setTimeout(() => {
                document.getElementById('payment-order-id').textContent = currentOrder.orderId;
                document.getElementById('payment-total').textContent    = `R$ ${currentOrder.totalPrice.toFixed(2)}`;
            }, 100);
        } else {
            window.showToast?.('Erro ao criar pedido: ' + (result.errors?.join(' ') || 'Tente novamente'), 'error');
        }
    } catch (err) {
        if (!err?.sessionExpired) window.showToast?.('Erro de conexão ao processar pedido.', 'error');
    }
}

// ── Confirm payment ────────────────────────────────────────────────────
export async function confirmPayment() {
    if (!currentOrder) return;
    try {
        const res = await apiFetch(`${API_URL}/${currentOrder.orderId}/checkout`, { method: 'POST' });
        if (res.ok) {
            window.showToast?.('Pagamento aprovado! Pedido em preparo.', 'success');
            window.showSection('orders');
        } else {
            const result = await res.json();
            window.showToast?.('Erro no pagamento: ' + (result.errors?.join(' ') || 'Tente novamente'), 'error');
        }
    } catch (err) {
        if (!err?.sessionExpired) window.showToast?.('Erro de conexão.', 'error');
    }
}

// ── Load orders ────────────────────────────────────────────────────────
export async function loadOrders() {
    const list = document.getElementById('orders-list');
    if (!list) return;

    if (!isLoggedIn()) { list.innerHTML = unauthHTML(); return; }

    list.innerHTML = skeletonHTML();

    try {
        const res    = await apiFetch(MY_API_URL);
        const result = await res.json();

        if (!res.ok) { list.innerHTML = errorHTML('Erro ao carregar pedidos.'); return; }

        ordersCache = (result.data || [])
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        if (!ordersCache.length) { list.innerHTML = emptyHTML(); return; }

        list.innerHTML = ordersCache.map(cardHTML).join('');
        list.querySelectorAll('.orc').forEach((el, i) => {
            setTimeout(() => el.classList.add('orc--in'), i * 60);
        });
    } catch (err) {
        if (!err?.sessionExpired) list.innerHTML = emptyHTML();
    }
}

// ── Card HTML ──────────────────────────────────────────────────────────
function cardHTML(order) {
    const st    = STATUS[order.orderStatus] ?? { label: order.orderStatus, dot: '#aaa', bg: '#f5f5f5', color: '#777' };
    const date  = new Date(order.createdAt);
    const day   = date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
    const time  = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const cnt   = order.orderItems?.length ?? 0;
    const total = Number(order.totalPrice).toFixed(2);

    const cur      = FLOW.indexOf(order.orderStatus);
    const canceled = order.orderStatus === 'CANCELED';

    const trackHTML = canceled
        ? `<div class="orc__track orc__track--canceled"><span>Pedido cancelado</span></div>`
        : `<div class="orc__track">${FLOW.map((s, i) => `
              <div class="orc__step${i < cur ? ' orc__step--past' : ''}${i === cur ? ' orc__step--now' : ''}">
                <div class="orc__pip"></div>${i < FLOW.length - 1 ? `<div class="orc__bar${i < cur ? ' orc__bar--fill' : ''}"></div>` : ''}
              </div>`).join('')}
           </div>`;

    return `
<article class="orc" onclick="openOrderDetail(${order.orderId})">
  <div class="orc__top">
    <div class="orc__brand">
      <div class="orc__logo">FF</div>
      <div>
        <div class="orc__store-name">FatFood</div>
        <div class="orc__id">Pedido #${order.orderId}</div>
      </div>
    </div>
    <span class="orc__badge" style="background:${st.bg};color:${st.color}">
      <span class="orc__dot" style="background:${st.dot}"></span>${st.label}
    </span>
  </div>
  ${trackHTML}
  <div class="orc__mid">
    <div class="orc__meta">
      <span class="orc__day">${day}</span>
      <span class="orc__time">${time} · <span class="orc__cnt">${cnt} item${cnt !== 1 ? 's' : ''}</span></span>
    </div>
    <span class="orc__price">R$&nbsp;${total}</span>
  </div>
  <div class="orc__bot">
    <button class="orc__btn" onclick="event.stopPropagation();openOrderDetail(${order.orderId})">
      Ver detalhes <span class="orc__arrow">→</span>
    </button>
  </div>
</article>`;
}

// ── Detail drawer ──────────────────────────────────────────────────────
function openOrderDetail(orderId) {
    const order = ordersCache.find(o => o.orderId === orderId);
    if (!order) return;

    document.getElementById('ord-modal')?.remove();

    const st      = STATUS[order.orderStatus] ?? { label: order.orderStatus, dot: '#aaa', bg: '#f5f5f5', color: '#777' };
    const date    = new Date(order.createdAt);
    const dayFull = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
    const time    = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const items   = order.orderItems || [];

    const cur      = FLOW.indexOf(order.orderStatus);
    const canceled = order.orderStatus === 'CANCELED';

    const timelineHTML = canceled
        ? `<div class="odr__timeline odr__timeline--canceled">Pedido cancelado</div>`
        : `<div class="odr__timeline">${FLOW.map((s, i) => `
              <div class="odr__tl-item${i <= cur ? ' odr__tl-done' : ''}${i === cur ? ' odr__tl-now' : ''}">
                <div class="odr__tl-pip"></div>
                <span class="odr__tl-lbl">${FLOW_LABELS[s]}</span>
                ${i < FLOW.length - 1 ? `<div class="odr__tl-bar${i < cur ? ' odr__tl-bar-fill' : ''}"></div>` : ''}
              </div>`).join('')}
           </div>`;

    const rowsHTML = items.length
        ? items.map(it => {
            const em    = emoji(it.productName);
            const price = Number(it.price).toFixed(2);
            const sub   = Number(it.totalPrice).toFixed(2);
            return `
<div class="odr__row">
  <span class="odr__em">${em}</span>
  <div class="odr__info">
    <span class="odr__name">${esc(it.productName || 'Produto #' + it.productId)}</span>
    <span class="odr__qty">${it.quantity}×&nbsp;R$&nbsp;${price} un.</span>
  </div>
  <span class="odr__sub">R$&nbsp;${sub}</span>
</div>`;
        }).join('')
        : `<p class="odr__none">Itens indisponíveis.</p>`;

    const overlay = document.createElement('div');
    overlay.id        = 'ord-modal';
    overlay.className = 'odr-overlay';
    overlay.innerHTML = `
<div class="odr" role="dialog" aria-modal="true">
  <div class="odr__handle"></div>
  <div class="odr__head">
    <div class="odr__head-l">
      <div class="odr__logo">FF</div>
      <div>
        <div class="odr__store">FatFood</div>
        <span class="odr__num">Pedido #${order.orderId}</span>
      </div>
    </div>
    <div class="odr__head-r">
      <span class="odr__badge" style="background:${st.bg};color:${st.color}">
        <span class="odr__dot" style="background:${st.dot}"></span>${st.label}
      </span>
      <button class="odr__close" onclick="closeOrderDetail()" aria-label="Fechar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  </div>
  <p class="odr__date">${dayFull} · ${time}</p>
  ${timelineHTML}
  <div class="odr__section">
    <p class="odr__label">Itens do pedido</p>
    <div class="odr__list">${rowsHTML}</div>
  </div>
  <div class="odr__total">
    <span>Total</span>
    <strong>R$&nbsp;${Number(order.totalPrice).toFixed(2)}</strong>
  </div>
</div>`;

    overlay.addEventListener('click', e => { if (e.target === overlay) closeOrderDetail(); });
    document.body.appendChild(overlay);
    document.addEventListener('keydown', escKey);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add('odr-overlay--open')));
}

function closeOrderDetail() {
    const ov = document.getElementById('ord-modal');
    if (!ov) return;
    ov.classList.remove('odr-overlay--open');
    document.removeEventListener('keydown', escKey);
    setTimeout(() => { ov.remove(); document.body.style.overflow = ''; }, 380);
}

function escKey(e) { if (e.key === 'Escape') closeOrderDetail(); }

// ── Helpers ────────────────────────────────────────────────────────────
function skeletonHTML() {
    return Array.from({ length: 3 }, (_, i) => `
<div class="orc-sk" style="opacity:${1 - i * 0.22}">
  <div class="sk sk--chip"></div>
  <div class="sk sk--mid"></div>
  <div class="sk sk--bot"></div>
</div>`).join('');
}

function emptyHTML() {
    return `
<div class="ord-empty">
  <div class="ord-empty__icon">🍽️</div>
  <p class="ord-empty__title">Faça seu pedido!</p>
  <p class="ord-empty__sub">Você ainda não realizou nenhum pedido.<br>Explore o cardápio e experimente algo delicioso.</p>
  <button class="ord-empty__cta" onclick="showSection('menu')">Ver cardápio →</button>
</div>`;
}

function unauthHTML() {
    return `
<div class="ord-empty">
  <div class="ord-empty__icon">🔒</div>
  <p class="ord-empty__title">Acesso restrito</p>
  <p class="ord-empty__sub">Faça login para visualizar seus pedidos.</p>
  <button class="ord-empty__cta" onclick="showSection('login')">Entrar na conta →</button>
</div>`;
}

function errorHTML(msg) {
    return `<div class="ord-err"><span>⚠</span><p>${msg}</p></div>`;
}

// ── Window exports ─────────────────────────────────────────────────────
window.confirmPayment   = confirmPayment;
window.openOrderDetail  = openOrderDetail;
window.closeOrderDetail = closeOrderDetail;
window.loadOrders       = loadOrders;

import { initProductManagement, loadProductsAdmin } from './product-management.js';
import { initCategoryManagement, loadCategoriesAdmin } from './category-management.js';
import { apiFetch } from './token.js';
import { STATUS as STATUS_DISPLAY } from './utils.js';

const STATUS_META = {
    PREPARING: { label: 'Preparando', indClass: 'p-ind-preparing', color: '#2563eb' },
    PENDING:   { label: 'Aguardando', indClass: 'p-ind-pending',   color: '#f59e0b' },
    PAID:      { label: 'Pago',       indClass: 'p-ind-paid',      color: '#7c3aed' },
    COMPLETED: { label: 'Concluído',  indClass: 'p-ind-completed', color: '#16a34a' },
    CANCELED:  { label: 'Cancelado',  indClass: 'p-ind-canceled',  color: '#dc2626' },
};

const STATUS_TRANSITIONS = {
    PENDING:   [{ label: 'Confirmar pagamento', val: 1 }, { label: 'Cancelar', val: 4 }],
    PAID:      [{ label: 'Iniciar preparo',     val: 2 }, { label: 'Cancelar', val: 4 }],
    PREPARING: [{ label: 'Concluir pedido',     val: 3 }, { label: 'Cancelar', val: 4 }],
    COMPLETED: [],
    CANCELED:  [],
};

const TAB_TITLES = { overview: 'Visão Geral', orders: 'Pedidos', products: 'Produtos', categories: 'Categorias' };

// ── State ──────────────────────────────────────────────────────────────
let revenueChart    = null;
let activeTab       = 'overview';
let allAdminOrders  = [];
let filterStatus    = 'ALL';

// ── Entry point ────────────────────────────────────────────────────────
export function initDashboard() {
    activeTab    = 'overview';
    filterStatus = 'ALL';
    setDate();
    loadDashboardOverview();
    initSidebarNav();
}

function initSidebarNav() {
    document.querySelectorAll('.adm-nav-item').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
}

// ── Tab switching ──────────────────────────────────────────────────────
function switchTab(name) {
    activeTab = name;

    document.querySelectorAll('.adm-nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === name));

    ['overview', 'orders', 'products', 'categories'].forEach(tab => {
        const el = document.getElementById(`tab-${tab}`);
        if (el) el.style.display = tab === name ? '' : 'none';
    });

    const titleEl = document.getElementById('adm-page-title');
    if (titleEl) titleEl.textContent = TAB_TITLES[name] ?? name;

    if (name === 'products')   initProductManagement();
    if (name === 'orders')     loadAdminOrders();
    if (name === 'categories') initCategoryManagement();
}

// ── Refresh ────────────────────────────────────────────────────────────
function dashRefresh() {
    if (activeTab === 'products') {
        loadProductsAdmin();
    } else if (activeTab === 'orders') {
        loadAdminOrders();
    } else if (activeTab === 'categories') {
        loadCategoriesAdmin();
    } else {
        setDate();
        loadDashboardOverview();
    }
}

// ── Sidebar toggle ─────────────────────────────────────────────────────
function toggleSidebar() {
    const sidebar = document.getElementById('adm-sidebar');
    const overlay = document.getElementById('adm-overlay');
    if (!sidebar) return;

    if (window.innerWidth <= 860) {
        const isOpen = sidebar.classList.toggle('open');
        overlay?.classList.toggle('visible', isOpen);
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

// ── Dashboard overview (API) ───────────────────────────────────────────
async function loadDashboardOverview() {
    try {
        const res  = await apiFetch('v1/api/dashboard/overview');
        const body = await res.json();

        if (!res.ok) {
            console.warn('Erro ao carregar overview do dashboard:', body.errors);
            return;
        }

        const d = body.data;

        // KPIs
        const fmt = v => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const elRevenue   = document.getElementById('kpi-daily-revenue');
        const elOrders    = document.getElementById('kpi-orders-today');
        const elAvgTicket = document.getElementById('kpi-avg-ticket');

        if (elRevenue)   elRevenue.textContent   = `R$ ${fmt(d.dailyRevenue)}`;
        if (elOrders)    elOrders.textContent     = d.dailyOrdersCount;
        if (elAvgTicket) elAvgTicket.textContent  = `R$ ${fmt(d.averageTicket)}`;

        // Pipeline total tag
        const totalOrders = d.pipeline.reduce((s, p) => s + p.count, 0);
        const tagEl = document.getElementById('pipeline-total-tag');
        if (tagEl) tagEl.textContent = `${totalOrders} total`;

        renderPipeline(d.pipeline);
        renderBestSellers(d.bestSellers);
        renderRecentOrders(d.recentOrders);
        renderRevenueChart(d.revenueByDay);
        requestAnimationFrame(() => animateProgressBars());
    } catch (err) {
        if (!err?.sessionExpired) console.warn('Erro ao carregar dashboard:', err);
    }
}

// ── Admin orders ───────────────────────────────────────────────────────
async function loadAdminOrders() {
    const container = document.getElementById('admin-orders-list');
    const countEl   = document.getElementById('ao-count');
    if (!container) return;

    container.innerHTML = '<div class="ao-loading">Carregando pedidos...</div>';

    try {
        const res  = await apiFetch('v1/api/orders');
        const data = await res.json();

        if (!res.ok) {
            container.innerHTML = '<div class="ao-error">Erro ao carregar pedidos.</div>';
            return;
        }

        allAdminOrders = data.data || [];
        if (countEl) countEl.textContent = `${allAdminOrders.length} pedido${allAdminOrders.length !== 1 ? 's' : ''}`;
        renderFilteredOrders();
    } catch (err) {
        if (!err?.sessionExpired) container.innerHTML = '<div class="ao-error">Erro de conexão.</div>';
    }
}

function renderFilteredOrders() {
    const container = document.getElementById('admin-orders-list');
    if (!container) return;

    const list = filterStatus === 'ALL'
        ? allAdminOrders
        : allAdminOrders.filter(o => o.orderStatus === filterStatus);

    if (list.length === 0) {
        container.innerHTML = '<div class="ao-empty">Nenhum pedido encontrado.</div>';
        return;
    }
    container.innerHTML = list.map(adminOrderRowTemplate).join('');
}

function setOrderFilter(status) {
    filterStatus = status;
    document.querySelectorAll('.ao-filter-btn').forEach(btn => {
        btn.classList.toggle('ao-filter-btn--active', btn.dataset.status === status);
    });
    renderFilteredOrders();
}

function adminOrderRowTemplate(o) {
    const s       = STATUS_DISPLAY[o.orderStatus] ?? { label: o.orderStatus, dot: '#aaa', bg: '#f5f5f5', color: '#888' };
    const date    = new Date(o.createdAt);
    const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const items   = o.orderItems?.length ?? 0;
    const trans   = STATUS_TRANSITIONS[o.orderStatus] ?? [];

    const actionBtns = trans.map(t => `
        <button class="ao-btn ${t.val === 4 ? 'ao-btn-cancel' : 'ao-btn-advance'}"
                onclick="updateOrderStatus(${o.orderId}, ${t.val})">${t.label}</button>
    `).join('');

    return `
    <div class="ao-row" id="ao-row-${o.orderId}">
      <div class="ao-card-top">
        <div class="ao-meta">
          <span class="ao-id">#${o.orderId}</span>
          <div class="ao-card-info">
            <span class="ao-date">${dateStr} · ${timeStr}</span>
            <span class="ao-items">${items} item${items !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <span class="s-chip" style="background:${s.bg};color:${s.color}">
          <span class="s-chip-dot" style="background:${s.dot}"></span>${s.label}
        </span>
      </div>
      <div class="ao-card-bot">
        <span class="ao-total">R$&nbsp;${Number(o.totalPrice).toFixed(2)}</span>
        <div class="ao-actions">${actionBtns}</div>
      </div>
    </div>`;
}

async function updateOrderStatus(orderId, statusVal) {
    const row  = document.getElementById(`ao-row-${orderId}`);
    const btns = row?.querySelectorAll('.ao-btn');
    btns?.forEach(b => { b.disabled = true; });

    try {
        const res = await apiFetch(`v1/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(statusVal),
        });

        if (res.ok) {
            window.showToast?.('Status atualizado!', 'success');
            loadAdminOrders();
        } else {
            const body = await res.json().catch(() => null);
            window.showToast?.(body?.data || 'Erro ao atualizar status.', 'error');
            btns?.forEach(b => { b.disabled = false; });
        }
    } catch (err) {
        if (!err?.sessionExpired) window.showToast?.('Erro de conexão.', 'error');
        btns?.forEach(b => { b.disabled = false; });
    }
}

// ── Date ───────────────────────────────────────────────────────────────
function setDate() {
    const el = document.getElementById('dash-date');
    if (!el) return;
    el.textContent = new Date().toLocaleDateString('pt-BR', {
        weekday: 'long', day: '2-digit', month: 'long',
    });
}

// ── Pipeline ───────────────────────────────────────────────────────────
function renderPipeline(pipelineData) {
    const container = document.getElementById('pipeline-rows');
    if (!container) return;

    const total = pipelineData.reduce((s, p) => s + p.count, 0) || 1;

    container.innerHTML = pipelineData.map(p => {
        const meta = STATUS_META[p.state] ?? { label: p.state, indClass: '', color: '#aaa' };
        return `
            <div class="pipeline-row">
                <div class="pipeline-state">
                    <span class="p-indicator ${meta.indClass}"></span>
                    <span class="p-name">${meta.label}</span>
                </div>
                <div class="p-track">
                    <div class="p-fill" data-w="${Math.round((p.count / total) * 100)}" style="background:${meta.color}"></div>
                </div>
                <span class="p-count">${p.count}</span>
            </div>`;
    }).join('');
}

// ── Best sellers ───────────────────────────────────────────────────────
function renderBestSellers(sellers) {
    const container = document.getElementById('dash-best-sellers');
    if (!container || !sellers.length) return;

    const max = sellers[0].sales || 1;
    container.innerHTML = sellers.map((item, i) => `
        <div class="seller-row">
            <span class="seller-rank${i === 0 ? ' top' : ''}">${i + 1}</span>
            <div class="seller-info">
                <div class="seller-name-txt">${item.name}</div>
                <div class="seller-bar-t">
                    <div class="seller-bar-f" data-w="${Math.round((item.sales / max) * 100)}"></div>
                </div>
            </div>
            <span class="seller-cnt">${item.sales}×</span>
        </div>
    `).join('');
}

// ── Recent orders ──────────────────────────────────────────────────────
function renderRecentOrders(orders) {
    const container = document.getElementById('dash-recent-orders');
    if (!container) return;

    if (!orders.length) {
        container.innerHTML = '<p style="color:#999;font-size:13px;padding:8px 0">Nenhum pedido recente.</p>';
        return;
    }

    container.innerHTML = orders.map(o => {
        const s = STATUS_DISPLAY[o.status] ?? { label: o.status, dot: '#aaa', bg: '#f5f5f5', color: '#888' };
        return `
            <div class="order-row">
                <div class="order-left">
                    <span class="order-id">#${o.id}</span>
                    <div>
                        <div class="order-name">${o.customer}</div>
                        <div class="order-time">${o.time}</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:12px">
                    <span class="s-chip" style="background:${s.bg};color:${s.color}">
                        <span class="s-chip-dot" style="background:${s.dot}"></span>${s.label}
                    </span>
                    <span class="order-amount">R$&nbsp;${o.total.toFixed(2)}</span>
                </div>
            </div>`;
    }).join('');
}

// ── Revenue chart ──────────────────────────────────────────────────────
function renderRevenueChart(revenueByDay) {
    if (!window.Chart) return;
    const canvas = document.getElementById('revenueChart');
    if (!canvas) return;

    if (revenueChart) { revenueChart.destroy(); revenueChart = null; }

    const labels = revenueByDay.map(d => d.day);
    const values = revenueByDay.map(d => d.revenue);

    const ctx  = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 190);
    grad.addColorStop(0, 'rgba(192,57,43,.15)');
    grad.addColorStop(1, 'rgba(192,57,43,0)');

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                data: values,
                borderColor: '#C0392B',
                backgroundColor: grad,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#C0392B',
                pointBorderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: '#C0392B',
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 700, easing: 'easeOutQuart' },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1D1D1D',
                    titleColor: '#888',
                    bodyColor: '#fff',
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: items => items[0].label,
                        label: ctx => 'R$ ' + ctx.raw.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
                    },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    border: { display: false },
                    ticks: { font: { size: 11, weight: '600' }, color: '#CCC' },
                },
                y: {
                    grid: { color: 'rgba(0,0,0,.04)', drawBorder: false },
                    border: { display: false },
                    ticks: { font: { size: 10 }, color: '#CCC', callback: v => 'R$' + (v / 1000).toFixed(1) + 'k' },
                },
            },
        },
    });
}

// ── Animate bars ───────────────────────────────────────────────────────
function animateProgressBars() {
    document.querySelectorAll('.p-fill[data-w], .seller-bar-f[data-w]').forEach(el => {
        el.style.width = el.dataset.w + '%';
    });
}

// ── Window exports ─────────────────────────────────────────────────────
window.initDashboard     = initDashboard;
window.switchTab         = switchTab;
window.dashRefresh       = dashRefresh;
window.toggleSidebar     = toggleSidebar;
window.loadAdminOrders   = loadAdminOrders;
window.updateOrderStatus = updateOrderStatus;
window.setOrderFilter    = setOrderFilter;
window.loadCategoriesAdmin = loadCategoriesAdmin;

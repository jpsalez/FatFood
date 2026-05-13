import { addToCart } from './cart.js';
import { escHtml, productEmoji } from './utils.js';

const API_URL = 'v1/api/products';
const CAT_URL = 'v1/api/categories';
let currentProducts = [];
let activeCategory   = 'all';

// ── Load from API ──────────────────────────────────────────────────────
export async function loadProducts() {
    const grid  = document.getElementById('products-list');
    const count = document.getElementById('product-count');
    if (!grid) return;

    showSkeletons(grid, 6);

    try {
        const [prodRes, catRes] = await Promise.all([fetch(API_URL), fetch(CAT_URL)]);
        const prodData = await prodRes.json();
        const catData  = await catRes.json();

        if (prodRes.ok) {
            currentProducts = prodData.data || [];
            const categories = catData.data  || [];
            buildFilterTabs(categories);
            renderFiltered(grid, count);
            initFilterTabs(grid, count);
        } else {
            grid.innerHTML = '<p class="menu-error">Erro ao carregar o cardápio.</p>';
        }
    } catch {
        grid.innerHTML = '<p class="menu-error">Erro de conexão com o servidor.</p>';
    }
}

// ── Skeleton placeholders ──────────────────────────────────────────────
function showSkeletons(container, n) {
    container.innerHTML = Array.from({ length: n }, () => `
        <div class="product-skeleton">
            <div class="sk-visual"></div>
            <div class="sk-body">
                <div class="sk-chip"></div>
                <div class="sk-name"></div>
                <div class="sk-desc"></div>
                <div class="sk-desc short"></div>
                <div class="sk-foot"></div>
            </div>
        </div>
    `).join('');
}

// ── Build filter tabs from API categories ──────────────────────────────
function buildFilterTabs(categories) {
    const tabs = document.getElementById('mf-tabs');
    if (!tabs) return;
    const extra = categories.map(c =>
        `<button class="mf-tab" data-cat="${escHtml(c.name)}">${escHtml(c.name)}</button>`
    ).join('');
    tabs.innerHTML = `<button class="mf-tab active" data-cat="all">Todos</button>${extra}`;
}

// ── Render filtered products ───────────────────────────────────────────
function renderFiltered(grid, countEl) {
    const visible = activeCategory === 'all'
        ? currentProducts
        : currentProducts.filter(p =>
            p.categories?.some(c => c.name === activeCategory));

    if (countEl) {
        countEl.textContent = visible.length
            ? `${visible.length} item${visible.length !== 1 ? 's' : ''}`
            : '';
    }

    if (visible.length === 0) {
        grid.innerHTML = `
            <div class="menu-empty">
                <span class="menu-empty-icon">🔍</span>
                <p>Nenhum produto nessa categoria.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = visible.map((product, i) => cardTemplate(product, i)).join('');
}

// ── Card template ──────────────────────────────────────────────────────
function cardTemplate(product, i) {
    const firstCat = product.categories?.[0];
    const color    = firstCat?.color ?? '#888888';
    const label    = firstCat?.name  ?? 'Outro';
    const delay    = Math.min(i * 0.06, 0.4);

    return `
    <article
        class="product-card"
        style="animation: fadeInUp .5s cubic-bezier(.16,1,.3,1) ${delay}s both"
        onclick="handleAddToCart(${product.id})"
        title="${escHtml(product.name)} — clique para adicionar"
    >
        <div class="pc-visual" style="background: linear-gradient(145deg, ${color}30 0%, ${color}0d 100%)">
            <span class="pc-emoji" aria-hidden="true">${productEmoji(product.name)}</span>
            <span class="pc-price-badge">R$&nbsp;${Number(product.price).toFixed(2)}</span>
        </div>
        <div class="pc-body">
            <span class="pc-chip" style="color:${color}; background:${color}1a">${escHtml(label)}</span>
            <h5 class="pc-name">${escHtml(product.name)}</h5>
            <p class="pc-desc">${escHtml(product.description)}</p>
            <button
                class="pc-btn"
                style="--btn-accent:${color}"
                onclick="handleAddToCart(${product.id}); event.stopPropagation()"
            >
                <span aria-hidden="true">+</span> Adicionar
            </button>
        </div>
    </article>`;
}

// ── Filter tabs ────────────────────────────────────────────────────────
function initFilterTabs(grid, countEl) {
    const tabs = document.getElementById('mf-tabs');
    if (!tabs) return;

    tabs.querySelectorAll('.mf-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.querySelectorAll('.mf-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeCategory = tab.dataset.cat;

            // Fade out → re-render → fade in handled by animation keyframe
            grid.style.opacity = '0';
            grid.style.transform = 'translateY(8px)';
            grid.style.transition = 'opacity .15s ease, transform .15s ease';

            setTimeout(() => {
                renderFiltered(grid, countEl);
                grid.style.opacity = '';
                grid.style.transform = '';
            }, 150);
        });
    });
}

// ── Global handlers ────────────────────────────────────────────────────
window.handleAddToCart = (id) => {
    const product = currentProducts.find(p => p.id === id);
    if (product) addToCart(product);
};

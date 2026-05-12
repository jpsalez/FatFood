import { addToCart } from './cart.js';

const API_URL = 'v1/api/products';
let currentProducts = [];
let activeCategory   = 'all';

// ── Category config ────────────────────────────────────────────────────
function getCategory(product) {
    const n = product.name.toLowerCase();
    if (n.includes('hambúrguer') || n.includes('burger') || n.includes('lanche') ||
        n.includes('combo')      || n.includes('sanduíche'))
        return { label: 'Lanche',          color: '#d63031', emoji: '🍔' };

    if (n.includes('batata') || n.includes('frita') || n.includes('porção') || n.includes('nugget'))
        return { label: 'Acompanhamento',  color: '#e17055', emoji: '🍟' };

    if (n.includes('refrigerante') || n.includes('coca')    || n.includes('guaraná') ||
        n.includes('suco')         || n.includes('água')    || n.includes('bebida')   ||
        n.includes('lata')         || n.includes('garrafa'))
        return { label: 'Bebida',          color: '#0984e3', emoji: '🥤' };

    if (n.includes('sobremesa') || n.includes('milk')   || n.includes('sorvete') ||
        n.includes('doce')      || n.includes('brownie') || n.includes('cheesecake'))
        return { label: 'Sobremesa',       color: '#a29bfe', emoji: '🍦' };

    return { label: 'Outro', color: '#00b894', emoji: '🍽️' };
}

// ── Load from API ──────────────────────────────────────────────────────
export async function loadProducts() {
    const grid  = document.getElementById('products-list');
    const count = document.getElementById('product-count');
    if (!grid) return;

    showSkeletons(grid, 6);

    try {
        const res  = await fetch(API_URL);
        const data = await res.json();

        if (res.ok) {
            currentProducts = data.data || [];
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

// ── Render filtered products ───────────────────────────────────────────
function renderFiltered(grid, countEl) {
    const visible = activeCategory === 'all'
        ? currentProducts
        : currentProducts.filter(p => getCategory(p).label === activeCategory);

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
    const cat = getCategory(product);
    const delay = Math.min(i * 0.06, 0.4);

    return `
    <article
        class="product-card"
        style="animation: fadeInUp .5s cubic-bezier(.16,1,.3,1) ${delay}s both"
        onclick="handleAddToCart(${product.id})"
        title="${escAttr(product.name)} — clique para adicionar"
    >
        <div class="pc-visual" style="background: linear-gradient(145deg, ${cat.color}30 0%, ${cat.color}0d 100%)">
            ${product.img
                ? `<img src="${escAttr(product.img)}" alt="" class="pc-img" onerror="this.style.display='none';this.nextElementSibling.style.display=''"><span class="pc-emoji" aria-hidden="true" style="display:none">${cat.emoji}</span>`
                : `<span class="pc-emoji" aria-hidden="true">${cat.emoji}</span>`
            }
            <span class="pc-price-badge">R$&nbsp;${Number(product.price).toFixed(2)}</span>
        </div>
        <div class="pc-body">
            <span class="pc-chip" style="color:${cat.color}; background:${cat.color}1a">${cat.label}</span>
            <h5 class="pc-name">${escHtml(product.name)}</h5>
            <p class="pc-desc">${escHtml(product.description)}</p>
            <button
                class="pc-btn"
                style="--btn-accent:${cat.color}"
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

// ── Helpers ────────────────────────────────────────────────────────────
function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ── Global handlers ────────────────────────────────────────────────────
window.handleAddToCart = (id) => {
    const product = currentProducts.find(p => p.id === id);
    if (product) addToCart(product);
};

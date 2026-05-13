import { apiFetch } from './token.js';
import { escHtml, escJs, API_BASE } from './utils.js';

const API = API_BASE;
let allCategories = [];
let allProductsForLink = [];

// ── Entry point ────────────────────────────────────────────────────────
export function initCategoryManagement() {
    loadCategoriesAdmin();
}

// ── Load all categories ────────────────────────────────────────────────
export async function loadCategoriesAdmin() {
    const body  = document.getElementById('cat-table-body');
    const count = document.getElementById('cat-count');
    if (!body) return;

    body.innerHTML = '<div style="padding:20px;color:#bbb;font-size:.85rem">Carregando...</div>';

    try {
        const [catRes, prodRes] = await Promise.all([
            fetch(`${API}/categories`),
            fetch(`${API}/products`),
        ]);
        const catData  = await catRes.json();
        const prodData = await prodRes.json();

        allCategories      = catData.data  || [];
        allProductsForLink = prodData.data || [];

        if (count) count.textContent = `${allCategories.length} categoria${allCategories.length !== 1 ? 's' : ''}`;

        if (allCategories.length === 0) {
            body.innerHTML = '';
            const empty = document.getElementById('cat-empty');
            if (empty) empty.style.display = 'flex';
            return;
        }

        const empty = document.getElementById('cat-empty');
        if (empty) empty.style.display = 'none';
        renderCategoryRows(allCategories, body);
    } catch {
        body.innerHTML = '<div style="padding:20px;color:#d63031;font-size:.85rem">Erro ao carregar categorias.</div>';
    }
}

// ── Render rows ────────────────────────────────────────────────────────
function renderCategoryRows(categories, container) {
    container.innerHTML = categories.map(c => {
        const linkedIds = allProductsForLink
            .filter(p => p.categories?.some(pc => pc.id === c.id))
            .map(p => p.id);
        const linkedCount = linkedIds.length;

        return `
        <div class="cat-row" id="cat-row-${c.id}">
            <span class="cat-color-dot" style="background:${escHtml(c.color)}"></span>
            <div class="cat-row-info">
                <div class="cat-row-name">${escHtml(c.name)}</div>
            </div>
            <span class="cat-prod-chip">${linkedCount} produto${linkedCount !== 1 ? 's' : ''}</span>
            <div class="cat-row-actions">
                <button class="pm-btn-edit" onclick="toggleCategoryProducts(${c.id})">Produtos</button>
                <button class="pm-btn-edit" onclick="openEditCategoryForm(${c.id})">Editar</button>
                <button class="pm-btn-del"  onclick="triggerInlineCategoryDelete(${c.id}, '${escJs(c.name)}')">Remover</button>
            </div>
        </div>
        <div class="cat-products-panel d-none" id="cat-panel-${c.id}">
            ${renderLinkedProducts(c.id, linkedIds)}
        </div>`;
    }).join('');
}

function renderLinkedProducts(categoryId, linkedIds) {
    const linked   = allProductsForLink.filter(p => linkedIds.includes(p.id));
    const unlinked = allProductsForLink.filter(p => !linkedIds.includes(p.id));

    const linkedHtml = linked.length > 0
        ? linked.map(p => `
            <span class="cat-prod-tag">
                ${escHtml(p.name)}
                <button class="cat-tag-remove" onclick="unlinkProductFromCategory(${categoryId}, ${p.id})" title="Desvincular">✕</button>
            </span>`).join('')
        : '<span class="cat-no-prods">Nenhum produto vinculado.</span>';

    const selectHtml = unlinked.length > 0 ? `
        <div class="cat-link-row">
            <select class="pm-input cat-prod-select" id="cat-link-select-${categoryId}">
                <option value="">Selecionar produto...</option>
                ${unlinked.map(p => `<option value="${p.id}">${escHtml(p.name)}</option>`).join('')}
            </select>
            <button class="pm-save-btn" style="padding:8px 14px" onclick="linkProductToCategory(${categoryId})">Vincular</button>
        </div>` : '';

    return `
        <div class="cat-linked-wrap">
            <div class="cat-linked-tags">${linkedHtml}</div>
            ${selectHtml}
        </div>`;
}

// ── Toggle product panel ───────────────────────────────────────────────
export function toggleCategoryProducts(id) {
    const panel = document.getElementById(`cat-panel-${id}`);
    if (!panel) return;
    panel.classList.toggle('d-none');
}

// ── Link / Unlink product ──────────────────────────────────────────────
export async function linkProductToCategory(categoryId) {
    const sel = document.getElementById(`cat-link-select-${categoryId}`);
    const productId = parseInt(sel?.value);
    if (!productId) { window.showToast?.('Selecione um produto.', 'info'); return; }

    try {
        const res = await apiFetch(`${API}/category/${categoryId}/product/${productId}`, { method: 'POST' });
        if (res.ok) {
            window.showToast?.('Produto vinculado!', 'success');
            loadCategoriesAdmin();
        } else {
            window.showToast?.('Erro ao vincular produto.', 'error');
        }
    } catch (err) {
        if (!err?.sessionExpired) window.showToast?.('Erro de conexão.', 'error');
    }
}

export async function unlinkProductFromCategory(categoryId, productId) {
    try {
        const res = await apiFetch(`${API}/category/${categoryId}/product/${productId}`, { method: 'DELETE' });
        if (res.ok) {
            window.showToast?.('Produto desvinculado.', 'info');
            loadCategoriesAdmin();
        } else {
            window.showToast?.('Erro ao desvincular produto.', 'error');
        }
    } catch (err) {
        if (!err?.sessionExpired) window.showToast?.('Erro de conexão.', 'error');
    }
}

// ── Form open / close ──────────────────────────────────────────────────
export function openCategoryForm() {
    const wrap = document.getElementById('cat-form-wrap');
    const form = document.getElementById('cat-form');
    if (!wrap || !form) return;
    form.reset();
    document.getElementById('cat-id').value = '';
    document.getElementById('cat-color').value = '#d63031';
    document.getElementById('cat-submit-btn').textContent = 'Salvar categoria';
    wrap.classList.add('open');
    setTimeout(() => document.getElementById('cat-name')?.focus(), 300);
}

export function openEditCategoryForm(id) {
    const cat = allCategories.find(c => c.id === id);
    if (!cat) return;
    const wrap = document.getElementById('cat-form-wrap');
    if (!wrap) return;
    document.getElementById('cat-id').value    = cat.id;
    document.getElementById('cat-name').value  = cat.name;
    document.getElementById('cat-color').value = cat.color;
    document.getElementById('cat-submit-btn').textContent = 'Salvar alterações';
    wrap.classList.add('open');
    setTimeout(() => document.getElementById('cat-name')?.focus(), 300);
}

export function closeCategoryForm() {
    document.getElementById('cat-form-wrap')?.classList.remove('open');
}

// ── Submit (create or update) ──────────────────────────────────────────
export async function submitCategoryForm(e) {
    e.preventDefault();
    const id    = document.getElementById('cat-id').value;
    const name  = document.getElementById('cat-name').value.trim();
    const color = document.getElementById('cat-color').value;
    const btn   = document.getElementById('cat-submit-btn');

    if (!name) { window.showToast?.('Informe o nome da categoria.', 'error'); return; }

    const payload = JSON.stringify({ id: id ? parseInt(id) : 0, name, color });
    const headers = { 'Content-Type': 'application/json' };

    btn.textContent = 'Salvando...';
    btn.disabled    = true;

    try {
        const res = id
            ? await apiFetch(`${API}/category/${id}`, { method: 'PUT',  headers, body: payload })
            : await apiFetch(`${API}/categories`,      { method: 'POST', headers, body: payload });

        if (res.ok) {
            window.showToast?.(id ? 'Categoria atualizada!' : 'Categoria criada!', 'success');
            closeCategoryForm();
            loadCategoriesAdmin();
        } else {
            const err = await res.json().catch(() => null);
            window.showToast?.(err?.errors?.join(' ') || 'Erro ao salvar.', 'error');
        }
    } catch (err) {
        if (!err?.sessionExpired) window.showToast?.('Erro de conexão.', 'error');
    } finally {
        btn.textContent = id ? 'Salvar alterações' : 'Salvar categoria';
        btn.disabled    = false;
    }
}

// ── Inline delete ──────────────────────────────────────────────────────
export function triggerInlineCategoryDelete(id, name) {
    const row = document.getElementById(`cat-row-${id}`);
    if (!row) return;
    row._origHTML = row.innerHTML;
    row.innerHTML = `
        <div class="pm-row-confirm">
            <span class="pm-confirm-msg">Remover <strong>${escHtml(name)}</strong>?</span>
            <div class="pm-confirm-actions">
                <button class="pm-btn-cancel-del" onclick="cancelInlineCategoryDelete(${id})">Cancelar</button>
                <button class="pm-btn-confirm-del" onclick="executeCategoryDelete(${id})">Remover</button>
            </div>
        </div>`;
}

export function cancelInlineCategoryDelete(id) {
    const row = document.getElementById(`cat-row-${id}`);
    if (!row || !row._origHTML) return;
    row.innerHTML = row._origHTML;
    row._origHTML = null;
}

export async function executeCategoryDelete(id) {
    try {
        const res = await apiFetch(`${API}/category/${id}`, { method: 'DELETE' });
        if (res.ok) {
            window.showToast?.('Categoria removida.', 'info');
            loadCategoriesAdmin();
        } else {
            window.showToast?.('Erro ao remover categoria.', 'error');
            cancelInlineCategoryDelete(id);
        }
    } catch (err) {
        if (!err?.sessionExpired) window.showToast?.('Erro de conexão.', 'error');
        cancelInlineCategoryDelete(id);
    }
}

// ── Expose to window ───────────────────────────────────────────────────
window.openCategoryForm              = openCategoryForm;
window.openEditCategoryForm          = openEditCategoryForm;
window.closeCategoryForm             = closeCategoryForm;
window.submitCategoryForm            = submitCategoryForm;
window.toggleCategoryProducts        = toggleCategoryProducts;
window.linkProductToCategory         = linkProductToCategory;
window.unlinkProductFromCategory     = unlinkProductFromCategory;
window.triggerInlineCategoryDelete   = triggerInlineCategoryDelete;
window.cancelInlineCategoryDelete    = cancelInlineCategoryDelete;
window.executeCategoryDelete         = executeCategoryDelete;
window.loadCategoriesAdmin           = loadCategoriesAdmin;

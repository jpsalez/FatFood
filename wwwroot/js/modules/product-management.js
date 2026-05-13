import { apiFetch } from './token.js';
import { escHtml, escJs, API_BASE } from './utils.js';

const API = API_BASE;
let allProducts   = [];
let allCategories = [];

// ── Entry point ────────────────────────────────────────────────────────
export async function initProductManagement() {
    await loadCategories();
    loadProductsAdmin();
}

async function loadCategories() {
    try {
        const res  = await fetch(`${API}/categories`);
        const data = await res.json();
        allCategories = data.data || [];
    } catch { allCategories = []; }
}

// ── Load all products ──────────────────────────────────────────────────
export async function loadProductsAdmin() {
    const body  = document.getElementById('pm-table-body');
    const empty = document.getElementById('pm-empty');
    const count = document.getElementById('pm-count');
    if (!body) return;

    body.innerHTML = '<div style="padding:20px 20px;color:#bbb;font-size:.85rem">Carregando...</div>';

    try {
        const res  = await fetch(`${API}/products`);
        const data = await res.json();
        allProducts = data.data || [];

        if (count) count.textContent = `${allProducts.length} produto${allProducts.length !== 1 ? 's' : ''}`;

        if (allProducts.length === 0) {
            body.innerHTML = '';
            if (empty) empty.style.display = 'flex';
            return;
        }

        if (empty) empty.style.display = 'none';
        renderProductRows(allProducts, body);

        // Rebuild category select in case categories changed
        buildCategorySelect();
    } catch {
        body.innerHTML = '<div style="padding:20px;color:#d63031;font-size:.85rem">Erro ao carregar produtos.</div>';
    }
}

// ── Render rows ────────────────────────────────────────────────────────
function renderProductRows(products, container) {
    container.innerHTML = products.map(p => {
        const firstCat = p.categories?.[0];
        const chipHtml = firstCat
            ? `<span class="pm-cat-chip" style="color:${firstCat.color};background:${firstCat.color}18">${escHtml(firstCat.name)}</span>`
            : `<span class="pm-cat-chip" style="color:#aaa;background:#f0f0f0">Sem categoria</span>`;

        return `
        <div class="pm-row" id="pm-row-${p.id}">
            <div class="pm-row-emoji-wrap" style="background:${firstCat ? firstCat.color + '18' : '#f0f0f0'}">🍽️</div>
            <div class="pm-row-info">
                <div class="pm-row-name">${escHtml(p.name)}</div>
                <div class="pm-row-desc">${escHtml(p.description)}</div>
            </div>
            ${chipHtml}
            <span class="pm-price">R$&nbsp;${Number(p.price).toFixed(2)}</span>
            <div class="pm-row-actions">
                <button class="pm-btn-edit" onclick="openEditForm(${p.id})">Editar</button>
                <button class="pm-btn-del" onclick="triggerInlineDelete(${p.id}, '${escJs(p.name)}')">Remover</button>
            </div>
        </div>`;
    }).join('');
}

// ── Build category checkboxes in form ──────────────────────────────────
function buildCategorySelect(selectedIds = []) {
    const wrap = document.getElementById('pm-categories-wrap');
    if (!wrap) return;
    if (allCategories.length === 0) {
        wrap.innerHTML = '<span style="color:#bbb;font-size:.78rem">Nenhuma categoria cadastrada.</span>';
        return;
    }
    wrap.innerHTML = allCategories.map(c => `
        <label class="pm-cat-check">
            <input type="checkbox" name="pm-cat" value="${c.id}" ${selectedIds.includes(c.id) ? 'checked' : ''}>
            <span class="pm-cat-check-dot" style="background:${c.color}"></span>
            ${escHtml(c.name)}
        </label>`).join('');
}

function getSelectedCategoryIds() {
    return Array.from(document.querySelectorAll('input[name="pm-cat"]:checked'))
        .map(el => parseInt(el.value));
}

// ── Form open / close ──────────────────────────────────────────────────
export function openProductForm() {
    const wrap = document.getElementById('pm-form-wrap');
    const form = document.getElementById('pm-form');
    if (!wrap || !form) return;

    form.reset();
    document.getElementById('pm-product-id').value = '';
    document.getElementById('pm-submit-btn').textContent = 'Salvar produto';
    buildCategorySelect([]);

    wrap.classList.add('open');
    wrap.setAttribute('aria-hidden', 'false');
    wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => document.getElementById('pm-name')?.focus(), 420);
}

export function openEditForm(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;

    const wrap = document.getElementById('pm-form-wrap');
    if (!wrap) return;

    document.getElementById('pm-product-id').value  = product.id;
    document.getElementById('pm-name').value         = product.name;
    document.getElementById('pm-description').value  = product.description;
    document.getElementById('pm-price').value        = Number(product.price).toFixed(2);
    document.getElementById('pm-submit-btn').textContent = 'Salvar Alterações';
    buildCategorySelect((product.categories || []).map(c => c.id));

    wrap.classList.add('open');
    wrap.setAttribute('aria-hidden', 'false');
    wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    setTimeout(() => document.getElementById('pm-name')?.focus(), 420);
}

export function closeProductForm() {
    const wrap = document.getElementById('pm-form-wrap');
    if (!wrap) return;
    wrap.classList.remove('open');
    wrap.setAttribute('aria-hidden', 'true');
}

// ── Submit (create or update) ──────────────────────────────────────────
export async function submitProductForm(e) {
    e.preventDefault();

    const id          = document.getElementById('pm-product-id').value;
    const name        = document.getElementById('pm-name').value.trim();
    const description = document.getElementById('pm-description').value.trim();
    const price       = parseFloat(document.getElementById('pm-price').value);
    const categoryIds = getSelectedCategoryIds();
    const submitBtn   = document.getElementById('pm-submit-btn');

    if (!name || !description || isNaN(price) || price < 0) {
        window.showToast?.('Preencha todos os campos corretamente.', 'error');
        return;
    }

    const payload = JSON.stringify({ id: id ? parseInt(id) : 0, name, description, price, categoryIds });
    const headers = { 'Content-Type': 'application/json' };

    submitBtn.textContent = 'Salvando...';
    submitBtn.disabled = true;

    try {
        const res = id
            ? await apiFetch(`${API}/product/${id}`, { method: 'PUT',  headers, body: payload })
            : await apiFetch(`${API}/products`,       { method: 'POST', headers, body: payload });

        if (res.ok) {
            window.showToast?.(id ? 'Produto atualizado!' : 'Produto criado com sucesso!', 'success');
            closeProductForm();
            loadProductsAdmin();
        } else {
            const err = await res.json().catch(() => null);
            window.showToast?.(err?.errors?.join(' ') || 'Erro ao salvar produto.', 'error');
        }
    } catch (err) {
        if (!err?.sessionExpired) window.showToast?.('Erro de conexão.', 'error');
    } finally {
        submitBtn.textContent = id ? 'Salvar Alterações' : 'Salvar Produto';
        submitBtn.disabled = false;
    }
}

// ── Inline delete ──────────────────────────────────────────────────────
export function triggerInlineDelete(id, name) {
    const row = document.getElementById(`pm-row-${id}`);
    if (!row) return;
    row._origHTML = row.innerHTML;
    row.innerHTML = `
        <div class="pm-row-confirm">
            <span class="pm-confirm-msg">Remover <strong>${escHtml(name)}</strong>?</span>
            <div class="pm-confirm-actions">
                <button class="pm-btn-cancel-del" onclick="cancelInlineDelete(${id})">Cancelar</button>
                <button class="pm-btn-confirm-del" onclick="executeDelete(${id})">Remover</button>
            </div>
        </div>`;
}

export function cancelInlineDelete(id) {
    const row = document.getElementById(`pm-row-${id}`);
    if (!row || !row._origHTML) return;
    row.innerHTML = row._origHTML;
    row._origHTML = null;
}

export async function executeDelete(id) {
    try {
        const res = await apiFetch(`${API}/product/${id}`, { method: 'DELETE' });

        if (res.ok) {
            window.showToast?.('Produto removido.', 'info');
            loadProductsAdmin();
        } else {
            window.showToast?.('Erro ao remover produto.', 'error');
            cancelInlineDelete(id);
        }
    } catch (err) {
        if (!err?.sessionExpired) window.showToast?.('Erro de conexão.', 'error');
        cancelInlineDelete(id);
    }
}

// ── Expose to window (HTML onclick handlers) ───────────────────────────
window.openProductForm     = openProductForm;
window.openEditForm        = openEditForm;
window.closeProductForm    = closeProductForm;
window.submitProductForm   = submitProductForm;
window.triggerInlineDelete = triggerInlineDelete;
window.cancelInlineDelete  = cancelInlineDelete;
window.executeDelete       = executeDelete;
window.loadProductsAdmin   = loadProductsAdmin;

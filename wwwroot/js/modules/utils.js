export const API_BASE = 'v1/api';

export const STATUS = {
    PENDING:   { label: 'Aguardando', dot: '#f59e0b', bg: '#fffbeb', color: '#92400e' },
    PAID:      { label: 'Pago',       dot: '#7c3aed', bg: '#f5f3ff', color: '#5b21b6' },
    PREPARING: { label: 'Preparando', dot: '#2563eb', bg: '#eff6ff', color: '#1d4ed8' },
    COMPLETED: { label: 'Concluído',  dot: '#16a34a', bg: '#f0fdf4', color: '#15803d' },
    CANCELED:  { label: 'Cancelado',  dot: '#dc2626', bg: '#fef2f2', color: '#b91c1c' },
};

export const FLOW        = ['PENDING', 'PAID', 'PREPARING', 'COMPLETED'];
export const FLOW_LABELS = { PENDING: 'Aguardando', PAID: 'Pago', PREPARING: 'Preparando', COMPLETED: 'Entregue' };

export function escHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

export function escJs(str) {
    return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

export function productEmoji(name) {
    const n = (name || '').toLowerCase();
    if (/hambúrguer|burger|lanche|combo|sanduíche/.test(n)) return '🍔';
    if (/batata|frita|porção|nugget/.test(n))               return '🍟';
    if (/refrigerante|coca|guaraná|suco|água|bebida|lata|garrafa/.test(n)) return '🥤';
    if (/sobremesa|milk|sorvete|doce|brownie|cheesecake/.test(n)) return '🍦';
    return '🍽️';
}

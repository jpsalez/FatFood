const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export function getToken() {
    return localStorage.getItem('token');
}

export function isLoggedIn() {
    return !!getToken();
}

export function getPayload() {
    const token = getToken();
    if (!token) return null;
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch {
        return null;
    }
}

export function getUserId() {
    const payload = getPayload();
    return payload?.UserId ?? payload?.id ?? null;
}

export function isAdmin() {
    const payload = getPayload();
    if (!payload) return false;
    const roles = payload[ROLE_CLAIM] ?? payload.role ?? payload.Roles;
    if (!roles) return false;
    return Array.isArray(roles) ? roles.includes('Admin') : roles === 'Admin';
}

// Wrapper autenticado — injeta Bearer token e trata 401 globalmente.
// Ao detectar sessão expirada: limpa o token, exibe aviso e redireciona para login.
// Lança { sessionExpired: true } para que os callers possam sair silenciosamente do catch.
export async function apiFetch(url, options = {}) {
    const token = getToken();
    const headers = {
        ...(options.headers ?? {}),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
        localStorage.removeItem('token');
        window.showToast?.('Sua sessão expirou. Faça login novamente.', 'info');
        setTimeout(() => window.showSection?.('login'), 1200);
        const err = new Error('SESSION_EXPIRED');
        err.sessionExpired = true;
        throw err;
    }

    return res;
}

export function getStatusBadgeClass(status) {
    const map = {
        PENDING: 'bg-warning text-dark',
        PAID: 'bg-success',
        PREPARING: 'bg-info',
        COMPLETED: 'bg-primary',
        CANCELED: 'bg-danger',
    };
    return map[status.toUpperCase()] ?? 'bg-secondary';
}

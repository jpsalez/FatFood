import { getStatusBadgeClass } from './token.js';

const MOCK_ORDERS = [
    { id: 101, customer: 'João Silva', status: 'PAID', total: 45.90 },
    { id: 102, customer: 'Maria Santos', status: 'PENDING', total: 22.50 },
    { id: 103, customer: 'Pedro Oliveira', status: 'PREPARING', total: 67.00 },
    { id: 104, customer: 'Ana Costa', status: 'COMPLETED', total: 34.00 }
];

const MOCK_BEST_SELLERS = [
    { name: 'Hambúrguer Clássico', sales: 150, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format' },
    { name: 'Batata Frita G', sales: 120, image: 'https://images.unsplash.com/photo-1573015084185-7205ba35a50e?w=100&auto=format' },
    { name: 'Refrigerante Lata', sales: 95, image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=100&auto=format' }
];

export function initAdmin() {
    adminLoadOrders();
    adminLoadBestSellers();
}

export function adminLoadOrders() {
    const tableBody = document.getElementById('admin-orders-table');
    if (!tableBody) return;

    tableBody.innerHTML = MOCK_ORDERS.map(order => `
        <tr>
            <td class="fw-bold">#${order.id}</td>
            <td>${order.customer}</td>
            <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
            <td class="fw-bold">R$ ${order.total.toFixed(2)}</td>
            <td>
                <div class="dropdown">
                    <button class="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown">
                        Ações
                    </button>
                    <ul class="dropdown-menu shadow border-0">
                        <li><a class="dropdown-item" href="#" onclick="adminUpdateStatus(${order.id}, 'PREPARING')">Preparar</a></li>
                        <li><a class="dropdown-item" href="#" onclick="adminUpdateStatus(${order.id}, 'COMPLETED')">Concluir</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="adminUpdateStatus(${order.id}, 'CANCELED')">Cancelar</a></li>
                    </ul>
                </div>
            </td>
        </tr>
    `).join('');
}

export function adminLoadBestSellers() {
    const container = document.getElementById('admin-best-sellers');
    if (!container) return;

    container.innerHTML = MOCK_BEST_SELLERS.map(item => `
        <div class="d-flex align-items-center mb-3">
            <img src="${item.image}" class="rounded-3 me-3" width="50" height="50" style="object-fit: cover;">
            <div class="flex-grow-1">
                <h6 class="mb-0 fw-bold">${item.name}</h6>
                <small class="text-muted">${item.sales} vendas</small>
            </div>
            <div class="text-primary fw-bold">
                <i class="fas fa-chevron-up me-1 small"></i>12%
            </div>
        </div>
    `).join('');
}

window.adminUpdateStatus = (id, newStatus) => {
    alert(`Status do pedido #${id} alterado para ${newStatus} (Simulado)`);
};

window.adminLoadOrders = adminLoadOrders;

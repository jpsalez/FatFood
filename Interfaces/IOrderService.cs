using Lanchonete.DTOs;
using Lanchonete.Enums;

namespace Lanchonete.Interfaces;

public interface IOrderService
{
    Task<List<OrderResponseDTO>> GetOrders();
    Task<List<OrderResponseDTO>> GetOrdersByUserId(int userId);
    Task<OrderResponseDTO> GetOrderById(int orderId);
    Task<OrderResponseDTO> CreateOrder(OrderRequestDTO orderRequest);
    Task<OrderResponseDTO> UpdateOrder(int orderId);
    Task<bool> updateStatus(int orderId, OrderStatus status);
    Task<OrderResponseDTO> Checkout(int orderId);
}

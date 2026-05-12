using Lanchonete.Models;

namespace Lanchonete.DTOs;

public class OrderResponseDTO
{
    public int OrderId { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal TotalPrice { get; set; }
    public string? OrderStatus { get; set; } 
    public List<OrderItemResponseDTO>? OrderItems { get; set; }
    
    
}

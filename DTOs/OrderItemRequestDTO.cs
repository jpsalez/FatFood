using System.ComponentModel.DataAnnotations;

namespace Lanchonete.DTOs;

public class OrderItemRequestDTO
{
    
    
    [Required]
    public int Quantity { get; set; }
    
    [Required]
    public int ProductId { get; set; }
    
}

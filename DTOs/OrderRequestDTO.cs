using System.ComponentModel.DataAnnotations;
using Lanchonete.Enums;
using Lanchonete.Models;

namespace Lanchonete.DTOs;

public class OrderRequestDTO
{
    
    [Required]
    public int UserId { get; set; }
    
    [Required]
    public List<OrderItemRequestDTO> Items { get; set; }
    
    [Required]
    public decimal TotalPrice { get; set; }
    
    
}

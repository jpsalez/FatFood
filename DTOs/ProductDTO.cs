using System.ComponentModel.DataAnnotations;

namespace Lanchonete.DTOs;

public class ProductDTO 
{
    
    
    public int Id { get; set; }
    [Required]
    [MaxLength(100)]
    public string Name {get; set;} = string.Empty;
    [Required]
    [MaxLength(100)]
    public string Description {get; set;} = string.Empty;
    [Required]
    public decimal Price {get; set;}
    public List<int> CategoryIds { get; set; } = new();
}

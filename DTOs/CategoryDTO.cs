using System.ComponentModel.DataAnnotations;

namespace Lanchonete.DTOs;

public class CategoryDTO
{
    public int Id { get; set; }
    [Required]
    [MaxLength(80)]
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#888888";
}

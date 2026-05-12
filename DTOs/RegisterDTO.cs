using System.ComponentModel.DataAnnotations;

namespace Lanchonete.DTOs;

public class RegisterDTO
{
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;
    
    [Required]
    public string Password { get; set; } = string.Empty;
    
    [Required]
    [Compare("Password")]
    public string ConfirmPassword { get; set; } = string.Empty;
    
    
    
}

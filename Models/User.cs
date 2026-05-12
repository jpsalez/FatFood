namespace Lanchonete.Models;

public class User
{
    public int Id {get; set;}
    public string Name {get; set;} = string.Empty;
    public string hashPassword {get; set;} = string.Empty;
    public List<Order> Orders {get; set;} = new List<Order>();
    
    public string Email {get; set;} = string.Empty;
    public List<UserRole> Roles {get; set;} = new List<UserRole>();
    
    
    
}

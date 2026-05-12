namespace Lanchonete.Models;

public class Product
{
    
    public int Id {get; set;}
    public string Name {get; set;} = string.Empty;
    public string Description {get; set;} = string.Empty;
    public decimal Price {get; set;}
    
    public int StockQuantity {get; set;} = 0;
    public string? Img { get; set; }

    public List<OrderItem> OrderItems {get; set;} = new List<OrderItem>();
}

namespace Lanchonete.Models;

public class Product
{
    
    public int Id {get; set;}
    public string Name {get; set;} = string.Empty;
    public string Description {get; set;} = string.Empty;
    public decimal Price {get; set;}
    
    public int StockQuantity {get; set;} = 0;

    public List<OrderItem> OrderItems {get; set;} = new List<OrderItem>();
    public List<ProductCategory> ProductCategories { get; set; } = new List<ProductCategory>();
}

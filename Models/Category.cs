namespace Lanchonete.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Color { get; set; } = "#888888";
    public List<ProductCategory> ProductCategories { get; set; } = new();
}

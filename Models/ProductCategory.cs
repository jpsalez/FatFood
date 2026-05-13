namespace Lanchonete.Models;

public class ProductCategory
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}

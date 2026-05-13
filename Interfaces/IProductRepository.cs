using Lanchonete.Models;

namespace Lanchonete.Interfaces;

public interface IProductRepository : IRepository<Product>
{
    Task<List<Product>> GetAllWithCategoriesAsync();
    Task<Product?> GetByIdWithCategoriesAsync(int id);
    Task SetProductCategoriesAsync(int productId, List<int> categoryIds);
}

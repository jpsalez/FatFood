using Lanchonete.Models;

namespace Lanchonete.Interfaces;

public interface ICategoryRepository : IRepository<Category>
{
    Task<bool> LinkProductAsync(int categoryId, int productId);
    Task<bool> UnlinkProductAsync(int categoryId, int productId);
}

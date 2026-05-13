using Lanchonete.DTOs;
using Lanchonete.Models;

namespace Lanchonete.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDTO>> GetAll();
    Task<CategoryDTO?> GetById(int id);
    Task<Category> Add(CategoryDTO model);
    Task<Category?> Update(int id, CategoryDTO model);
    Task<Category?> Delete(int id);
    Task<bool> LinkProduct(int categoryId, int productId);
    Task<bool> UnlinkProduct(int categoryId, int productId);
}

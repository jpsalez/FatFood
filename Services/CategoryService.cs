using Lanchonete.DTOs;
using Lanchonete.Interfaces;
using Lanchonete.Models;

namespace Lanchonete.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository) => _repository = repository;

    public async Task<List<CategoryDTO>> GetAll()
    {
        var list = await _repository.GetAllAsync();
        return list.Select(c => new CategoryDTO { Id = c.Id, Name = c.Name, Color = c.Color }).ToList();
    }

    public async Task<CategoryDTO?> GetById(int id)
    {
        var c = await _repository.GetByIdAsync(id);
        if (c == null) return null;
        return new CategoryDTO { Id = c.Id, Name = c.Name, Color = c.Color };
    }

    public async Task<Category> Add(CategoryDTO model)
    {
        var category = new Category { Name = model.Name, Color = model.Color };
        return await _repository.AddAsync(category);
    }

    public async Task<Category?> Update(int id, CategoryDTO model)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null) return null;
        category.Name  = model.Name;
        category.Color = model.Color;
        return await _repository.UpdateAsync(category);
    }

    public async Task<Category?> Delete(int id)
    {
        var category = await _repository.GetByIdAsync(id);
        if (category == null) return null;
        return await _repository.DeleteAsync(category);
    }

    public Task<bool> LinkProduct(int categoryId, int productId)
        => _repository.LinkProductAsync(categoryId, productId);

    public Task<bool> UnlinkProduct(int categoryId, int productId)
        => _repository.UnlinkProductAsync(categoryId, productId);
}

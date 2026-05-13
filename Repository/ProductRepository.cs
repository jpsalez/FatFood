using Lanchonete.Data;
using Lanchonete.Interfaces;
using Lanchonete.Models;
using Microsoft.EntityFrameworkCore;

namespace Lanchonete.Repository;

public class ProductRepository : Repository<Product>, IProductRepository
{
    private readonly DataContext _context;

    public ProductRepository(DataContext context) : base(context)
    {
        _context = context;
    }

    public async Task<List<Product>> GetAllWithCategoriesAsync()
    {
        return await _context.Products
            .Include(p => p.ProductCategories)
            .ThenInclude(pc => pc.Category)
            .ToListAsync();
    }

    public async Task<Product?> GetByIdWithCategoriesAsync(int id)
    {
        return await _context.Products
            .Include(p => p.ProductCategories)
            .ThenInclude(pc => pc.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task SetProductCategoriesAsync(int productId, List<int> categoryIds)
    {
        var existing = await _context.ProductCategories
            .Where(pc => pc.ProductId == productId)
            .ToListAsync();
        _context.ProductCategories.RemoveRange(existing);

        foreach (var categoryId in categoryIds)
            _context.ProductCategories.Add(new ProductCategory { ProductId = productId, CategoryId = categoryId });

        await _context.SaveChangesAsync();
    }
}

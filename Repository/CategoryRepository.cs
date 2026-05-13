using Lanchonete.Data;
using Lanchonete.Interfaces;
using Lanchonete.Models;
using Microsoft.EntityFrameworkCore;

namespace Lanchonete.Repository;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    private readonly DataContext _context;

    public CategoryRepository(DataContext context) : base(context)
    {
        _context = context;
    }

    public async Task<bool> LinkProductAsync(int categoryId, int productId)
    {
        var exists = await _context.ProductCategories
            .AnyAsync(pc => pc.CategoryId == categoryId && pc.ProductId == productId);
        if (exists) return true;

        var catExists  = await _context.Categories.AnyAsync(c => c.Id == categoryId);
        var prodExists = await _context.Products.AnyAsync(p => p.Id == productId);
        if (!catExists || !prodExists) return false;

        _context.ProductCategories.Add(new ProductCategory { CategoryId = categoryId, ProductId = productId });
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnlinkProductAsync(int categoryId, int productId)
    {
        var link = await _context.ProductCategories
            .FirstOrDefaultAsync(pc => pc.CategoryId == categoryId && pc.ProductId == productId);
        if (link == null) return false;

        _context.ProductCategories.Remove(link);
        await _context.SaveChangesAsync();
        return true;
    }
}

using Lanchonete.DTOs;
using Lanchonete.Interfaces;
using Lanchonete.Models;

namespace Lanchonete.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;

    public ProductService(IProductRepository repository) => _repository = repository;

    public async Task<List<ProductResponseDTO>> GetAllProducts()
    {
        var products = await _repository.GetAllWithCategoriesAsync();
        return products.Select(MapToResponse).ToList();
    }

    public async Task<ProductResponseDTO?> GetProductById(int id)
    {
        var product = await _repository.GetByIdWithCategoriesAsync(id);
        return product == null ? null : MapToResponse(product);
    }

    public async Task<Product> AddProduct(ProductDTO model)
    {
        var product = new Product
        {
            Name        = model.Name,
            Description = model.Description,
            Price       = model.Price
        };

        await _repository.AddAsync(product);

        if (model.CategoryIds.Count > 0)
            await _repository.SetProductCategoriesAsync(product.Id, model.CategoryIds);

        return product;
    }

    public async Task<Product?> UpdateProduct(int id, ProductDTO model)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null) return null;

        product.Name        = model.Name;
        product.Description = model.Description;
        product.Price       = model.Price;

        await _repository.UpdateAsync(product);
        await _repository.SetProductCategoriesAsync(id, model.CategoryIds);

        return product;
    }

    public async Task<Product?> DeleteProduct(int id)
    {
        var product = await _repository.GetByIdAsync(id);
        if (product == null) return null;
        return await _repository.DeleteAsync(product);
    }

    private static ProductResponseDTO MapToResponse(Product p) => new()
    {
        Id          = p.Id,
        Name        = p.Name,
        Description = p.Description,
        Price       = p.Price,
        StockQuantity = p.StockQuantity,
        Categories  = p.ProductCategories.Select(pc => new CategoryDTO
        {
            Id    = pc.Category.Id,
            Name  = pc.Category.Name,
            Color = pc.Category.Color
        }).ToList()
    };
}

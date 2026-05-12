using Lanchonete.DTOs;
using Lanchonete.Interfaces;
using Lanchonete.Models;
using Lanchonete.Repository;
using Microsoft.AspNetCore.Mvc;

namespace Lanchonete.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _repository;
    
    public ProductService(IProductRepository repository)
        => _repository = repository;
    public async Task<List<Product>> GetAllProducts( )
    {
        return await _repository.GetAllAsync();
    }

    public async Task<ProductDTO?> GetProductById(int id)
    {
        var product = await _repository.GetByIdAsync(id);

        if (product == null)
            return null;

        return new ProductDTO
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            Img = product.Img
        };
    }

    public async Task<Product> AddProduct(ProductDTO model)
    {
        var product = new Product
        {
            Name = model.Name,
            Description = model.Description,
            Price = model.Price,
            Img = model.Img
        };

        return  await _repository.AddAsync(product);
    }

    public async Task<Product?> UpdateProduct(int id, ProductDTO model)
    {
        var product = await _repository.GetByIdAsync(id);

        if (product == null)
            return null;

        product.Name = model.Name;
        product.Description = model.Description;
        product.Price = model.Price;
        product.Img = model.Img;

        return await _repository.UpdateAsync(product);
    }

    public async Task<Product?> DeleteProduct(int id)
    {
        var product = await _repository.GetByIdAsync(id);

        if (product == null)
            return null;

        return await _repository.DeleteAsync(product);
    }
}

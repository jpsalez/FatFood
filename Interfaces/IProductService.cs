using Lanchonete.DTOs;
using Lanchonete.Models;

namespace Lanchonete.Interfaces;

public interface IProductService
{
    Task<List<ProductResponseDTO>> GetAllProducts();
    Task<ProductResponseDTO?> GetProductById(int id);
    Task<Product> AddProduct(ProductDTO model);
    Task<Product?> UpdateProduct(int id, ProductDTO model);
    Task<Product?> DeleteProduct(int id);
}

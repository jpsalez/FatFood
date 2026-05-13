using Lanchonete.DTOs;
using Lanchonete.Extensions;
using Lanchonete.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lanchonete.Controllers;

[ApiController]
public class ProductController : ControllerBase
{

    [AllowAnonymous]
    [HttpGet("v1/api/products")]
    public async Task<ActionResult> GetAllProducts([FromServices] IProductService productService)
    {
        try
        {
            var products = await productService.GetAllProducts();
            return Ok(new ResultDTO<List<ProductResponseDTO>>(products));
        }
        catch (DbUpdateException e)
        {
            return StatusCode(500, new ResultDTO<string>(e.Message));
        }
        catch
        {
           return  StatusCode(500, "Erro interno no servidor");
        }
    }

    [AllowAnonymous]
    [HttpGet("v1/api/product/{id:int}")]
    public async Task<ActionResult> GetProductById([FromServices] IProductService productService, [FromRoute] int id)
    {
        try
        {
            var product = await productService.GetProductById(id);

            if(product ==  null)
                return NotFound(new ResultDTO<string>("Produto não encontrado"));

            return Ok(new ResultDTO<ProductResponseDTO>(product));
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, new ResultDTO<string>("Erro ao buscar produto no banco de dados"));
        }
        catch
        {
            return  StatusCode(500, "Erro interno no servidor");
        }
    }


    [Authorize(Roles = "Admin")]
    [HttpPost("v1/api/products")]
    public async Task<IActionResult> AddProduct([FromBody] ProductDTO model, [FromServices] IProductService productService)
    {
        if(!ModelState.IsValid)
            return BadRequest(new ResultDTO<string>(ModelState.GetErros()));

        try
        {
            await productService.AddProduct(model);

            return StatusCode(201, "Produto adicionado com sucesso");
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, "Erro ao salvar produto no banco de dados");
        }
        catch
        {
            return StatusCode(500, "Erro interno no servidor");
        }

    }


    [Authorize(Roles = "Admin")]
    [HttpPut("v1/api/product/{id}")]
    public async Task<IActionResult> UpdateProduct([FromRoute] int id, [FromBody] ProductDTO model, [FromServices] IProductService productService)
    {
        if (!ModelState.IsValid)
            return BadRequest( new ResultDTO<string>(ModelState.GetErros()));


        try
        {
            var product = await productService.UpdateProduct(id, model);

            if(product == null)
                return NotFound(new ResultDTO<string>("Produto não encontrado"));

            return StatusCode(200, "Produto atualizado com sucesso");
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, "Erro ao atualizar produto no banco de dados");
        }
        catch
        {
            return StatusCode(500, "Erro interno no servidor");
        }


    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("v1/api/product/{id}")]
    public async Task<IActionResult> DeleteProduct([FromRoute] int id, [FromServices] IProductService productService)
    {
        try
        {
            var product = await productService.DeleteProduct(id);

            if (product == null)
                return NotFound(new ResultDTO<string>("Produto não encontrado"));

            return StatusCode(200, "Produto removido com sucesso");
        }
        catch (DbUpdateException)
        {
            return StatusCode(500, "Erro ao remover produto no banco de dados");
        }
        catch
        {
            return StatusCode(500, "Erro interno no servidor");
        }
    }
}

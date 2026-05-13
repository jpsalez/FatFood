using Lanchonete.DTOs;
using Lanchonete.Extensions;
using Lanchonete.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lanchonete.Controllers;

[ApiController]
public class CategoryController : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("v1/api/categories")]
    public async Task<IActionResult> GetAll([FromServices] ICategoryService service)
    {
        try
        {
            var list = await service.GetAll();
            return Ok(new ResultDTO<List<CategoryDTO>>(list));
        }
        catch { return StatusCode(500, "Erro interno no servidor"); }
    }

    [AllowAnonymous]
    [HttpGet("v1/api/category/{id:int}")]
    public async Task<IActionResult> GetById([FromRoute] int id, [FromServices] ICategoryService service)
    {
        try
        {
            var cat = await service.GetById(id);
            if (cat == null) return NotFound(new ResultDTO<string>("Categoria não encontrada"));
            return Ok(new ResultDTO<CategoryDTO>(cat));
        }
        catch { return StatusCode(500, "Erro interno no servidor"); }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("v1/api/categories")]
    public async Task<IActionResult> Add([FromBody] CategoryDTO model, [FromServices] ICategoryService service)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ResultDTO<string>(ModelState.GetErros()));
        try
        {
            await service.Add(model);
            return StatusCode(201, "Categoria criada com sucesso");
        }
        catch (DbUpdateException) { return StatusCode(500, "Erro ao salvar categoria no banco de dados"); }
        catch { return StatusCode(500, "Erro interno no servidor"); }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("v1/api/category/{id:int}")]
    public async Task<IActionResult> Update([FromRoute] int id, [FromBody] CategoryDTO model, [FromServices] ICategoryService service)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ResultDTO<string>(ModelState.GetErros()));
        try
        {
            var result = await service.Update(id, model);
            if (result == null) return NotFound(new ResultDTO<string>("Categoria não encontrada"));
            return Ok("Categoria atualizada com sucesso");
        }
        catch (DbUpdateException) { return StatusCode(500, "Erro ao atualizar categoria no banco de dados"); }
        catch { return StatusCode(500, "Erro interno no servidor"); }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("v1/api/category/{id:int}")]
    public async Task<IActionResult> Delete([FromRoute] int id, [FromServices] ICategoryService service)
    {
        try
        {
            var result = await service.Delete(id);
            if (result == null) return NotFound(new ResultDTO<string>("Categoria não encontrada"));
            return Ok("Categoria removida com sucesso");
        }
        catch (DbUpdateException) { return StatusCode(500, "Erro ao remover categoria no banco de dados"); }
        catch { return StatusCode(500, "Erro interno no servidor"); }
    }

    [Authorize(Roles = "Admin")]
    [HttpPost("v1/api/category/{categoryId:int}/product/{productId:int}")]
    public async Task<IActionResult> LinkProduct([FromRoute] int categoryId, [FromRoute] int productId, [FromServices] ICategoryService service)
    {
        try
        {
            var ok = await service.LinkProduct(categoryId, productId);
            if (!ok) return NotFound(new ResultDTO<string>("Categoria ou produto não encontrado"));
            return Ok("Produto vinculado à categoria");
        }
        catch { return StatusCode(500, "Erro interno no servidor"); }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("v1/api/category/{categoryId:int}/product/{productId:int}")]
    public async Task<IActionResult> UnlinkProduct([FromRoute] int categoryId, [FromRoute] int productId, [FromServices] ICategoryService service)
    {
        try
        {
            var ok = await service.UnlinkProduct(categoryId, productId);
            if (!ok) return NotFound(new ResultDTO<string>("Vínculo não encontrado"));
            return Ok("Produto desvinculado da categoria");
        }
        catch { return StatusCode(500, "Erro interno no servidor"); }
    }
}

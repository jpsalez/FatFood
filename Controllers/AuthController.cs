using Lanchonete.Data;
using Lanchonete.DTOs;
using Lanchonete.Extensions;
using Lanchonete.Interfaces;
using Lanchonete.Models;
using Lanchonete.Repository;
using Lanchonete.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SecureIdentity.Password;

namespace Lanchonete.Controllers;


[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("v1/api/register")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO model)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ResultDTO<string>(ModelState.GetErros()));
        try
        {
            var result = await _authService.RegisterUser(model);
            
            
            if(result.Success == false)
                return BadRequest(new ResultDTO<string>(result.Error ?? "Requisição inválida"));

            return StatusCode(201, "Usuário cadastrado com sucesso");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Erro interno no servidor: {ex.Message}");
        }


    }


[HttpPost("v1/api/login")]
    public async Task<IActionResult> Login([FromBody] LoginDTO model)
    {
        if(!ModelState.IsValid)
            return BadRequest(new ResultDTO<string>(ModelState.GetErros()));


        try
        {
            var result = await _authService.Login(model);
            
            if(result.Success == false)
                return BadRequest(new ResultDTO<string>(result.Error ?? "Requisição inválida"));


            return Ok(result.Token);
        }
        catch
        {
            return StatusCode(500, "Erro interno no servidor");
        }
        
    }
    
}

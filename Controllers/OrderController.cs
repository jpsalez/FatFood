using System.Security.Claims;
using Lanchonete.DTOs;
using Lanchonete.Enums;
using Lanchonete.Extensions;
using Lanchonete.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lanchonete.Controllers;

[Authorize]
[ApiController]
[Route("v1/api")]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    
    [Authorize(Roles = "Admin")]
    [HttpGet("orders")]
    public async Task<IActionResult> Get()
    {
        try
        {
            var orders = await _orderService.GetOrders();
            return Ok(new ResultDTO<List<OrderResponseDTO>>(orders));
        }
        catch
        {
            return StatusCode(500, new ResultDTO<string>("Erro interno no servidor"));
        }
    }

    [HttpGet("orders/my")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userIdClaim = User.FindFirstValue("UserId");
        if (!int.TryParse(userIdClaim, out var userId))
            return StatusCode(500, new ResultDTO<string>("Erro ao identificar usuário no token"));

        try
        {
            var orders = await _orderService.GetOrdersByUserId(userId);
            return Ok(new ResultDTO<List<OrderResponseDTO>>(orders));
        }
        catch
        {
            return StatusCode(500, new ResultDTO<string>("Erro interno no servidor"));
        }
    }

 
    [HttpGet("orders/{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var order = await _orderService.GetOrderById(id);
            if (order == null)
                return NotFound(new ResultDTO<string>("Pedido não encontrado"));

            return Ok(new ResultDTO<OrderResponseDTO>(order));
        }
        catch
        {
            return StatusCode(500, new ResultDTO<string>("Erro interno no servidor"));
        }
    }

    [HttpPost("orders")]
    public async Task<IActionResult> Create([FromBody] OrderRequestDTO model)
    {
        if (!ModelState.IsValid)
            return BadRequest(new ResultDTO<string>(ModelState.GetErros()));

        try
        {
            var result = await _orderService.CreateOrder(model);
            return StatusCode(201, new ResultDTO<OrderResponseDTO>(result));
        }
        catch (Exception ex)
        {
            return BadRequest(new ResultDTO<string>(ex.Message));
        }
    }

    [HttpPost("orders/{id:int}/checkout")]
    public async Task<IActionResult> Checkout(int id)
    {
        try
        {
            var result = await _orderService.Checkout(id);
            if (result == null)
                return NotFound(new ResultDTO<string>("Pedido não encontrado"));

            return Ok(new ResultDTO<OrderResponseDTO>(result));
        }
        catch (Exception ex)
        {
            return BadRequest(new ResultDTO<string>(ex.Message));
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("orders/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] OrderStatus status)
    {
        try
        {
            var success = await _orderService.updateStatus(id, status);
            if (!success)
                return BadRequest(new ResultDTO<string>("Transição de status inválida ou pedido não encontrado"));

            return Ok(new ResultDTO<string>("Status atualizado com sucesso"));
        }
        catch
        {
            return StatusCode(500, new ResultDTO<string>("Erro interno no servidor"));
        }
    }
}

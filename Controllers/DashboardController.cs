using Lanchonete.DTOs;
using Lanchonete.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Lanchonete.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("v1/api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("overview")]
    public async Task<IActionResult> GetOverview()
    {
        try
        {
            var overview = await _dashboardService.GetOverview();
            return Ok(new ResultDTO<DashboardOverviewDTO>(overview));
        }
        catch
        {
            return StatusCode(500, new ResultDTO<string>("Erro interno no servidor"));
        }
    }
}

using Lanchonete.DTOs;

namespace Lanchonete.Interfaces;

public interface IDashboardService
{
    Task<DashboardOverviewDTO> GetOverview();
}
using System.Globalization;
using Lanchonete.Data;
using Lanchonete.DTOs;
using Lanchonete.Enums;
using Lanchonete.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Lanchonete.Services;

public class DashboardService : IDashboardService
{
    private readonly DataContext _context;

    public DashboardService(DataContext context)
    {
        _context = context;
    }

    public async Task<DashboardOverviewDTO> GetOverview()
    {
        var today = DateTime.Today;
        var weekStart = today.AddDays(-6);
        var ptBR = new CultureInfo("pt-BR");

        var weekOrders = await _context.Orders
            .Where(o => o.CreatedAt >= weekStart && o.Status != OrderStatus.CANCELED)
            .ToListAsync();

        var todayOrders = weekOrders.Where(o => o.CreatedAt.Date == today).ToList();

        var revenueByDay = Enumerable.Range(0, 7)
            .Select(i => today.AddDays(-(6 - i)))
            .Select(day => new RevenueByDayDTO
            {
                Day = day.ToString("ddd", ptBR),
                Revenue = weekOrders.Where(o => o.CreatedAt.Date == day).Sum(o => o.TotalPrice),
            })
            .ToList();

        var averageTicket = Math.Round(
            await _context.Orders
                .Where(o => o.Status != OrderStatus.CANCELED)
                .Select(o => (decimal?)o.TotalPrice)
                .AverageAsync() ?? 0m,
            2);

        var recentOrders = (await _context.Orders
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .ToListAsync())
            .Select(o => new RecentOrderDTO
            {
                Id = o.Id,
                Customer = o.User.Name,
                Status = o.Status.ToString(),
                Total = o.TotalPrice,
                Time = o.CreatedAt.ToString("HH:mm"),
            })
            .ToList();

        var topIds = await _context.OrderItems
            .GroupBy(oi => oi.ProductId)
            .Select(g => new { ProductId = g.Key, Sales = g.Sum(oi => oi.Quantity) })
            .OrderByDescending(g => g.Sales)
            .Take(5)
            .ToListAsync();

        var productNames = await _context.Products
            .Where(p => topIds.Select(t => t.ProductId).Contains(p.Id))
            .ToDictionaryAsync(p => p.Id, p => p.Name);

        var bestSellers = topIds
            .Select(b => new BestSellerDTO
            {
                Name = productNames.GetValueOrDefault(b.ProductId, "Produto removido"),
                Sales = b.Sales,
            })
            .ToList();

        var pipelineRaw = await _context.Orders
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var pipeline = pipelineRaw
            .Select(g => new CountStatesDTO { State = g.Status.ToString(), count = g.Count })
            .ToList();

        return new DashboardOverviewDTO
        {
            DailyRevenue = todayOrders.Sum(o => o.TotalPrice),
            DailyOrdersCount = todayOrders.Count,
            AverageTicket = averageTicket,
            RevenueByDay = revenueByDay,
            RecentOrders = recentOrders,
            BestSellers = bestSellers,
            Pipeline = pipeline,
        };
    }
}

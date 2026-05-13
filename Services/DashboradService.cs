using System.Globalization;
using Lanchonete.Data;
using Lanchonete.DTOs;
using Lanchonete.Enums;
using Lanchonete.Interfaces;
using Lanchonete.Models;
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

        return new DashboardOverviewDTO
        {
            DailyRevenue     = await GetDailyRevenue(today),
            DailyOrdersCount = await GetDailyOrdersCount(today),
            AverageTicket    = await GetAverageTicket(),
            RevenueByDay     = await GetRevenueByDay(today),
            RecentOrders     = await GetRecentOrders(),
            BestSellers      = await GetBestSellers(),
            Pipeline         = await GetPipeline(),
        };
    }

    private async Task<decimal> GetDailyRevenue(DateTime today)
    {
        return await _context.Orders
            .Where(o => o.CreatedAt.Date == today && o.Status != OrderStatus.CANCELED)
            .SumAsync(o => o.TotalPrice);
    }

    private async Task<int> GetDailyOrdersCount(DateTime today)
    {
        return await _context.Orders
            .CountAsync(o => o.CreatedAt.Date == today && o.Status != OrderStatus.CANCELED);
    }

    private async Task<decimal> GetAverageTicket()
    {
        var avg = await _context.Orders
            .Where(o => o.Status != OrderStatus.CANCELED)
            .Select(o => (decimal?)o.TotalPrice)
            .AverageAsync();

        return Math.Round(avg ?? 0m, 2);
    }

    private async Task<List<RevenueByDayDTO>> GetRevenueByDay(DateTime today)
    {
        var startDate = today.AddDays(-6);
        var ptBR      = new CultureInfo("pt-BR");

        var revenues = await _context.Orders
            .Where(o => o.CreatedAt.Date >= startDate && o.CreatedAt.Date <= today
                        && o.Status != OrderStatus.CANCELED)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Revenue = g.Sum(o => o.TotalPrice) })
            .ToListAsync();

        var revenueDict = revenues.ToDictionary(r => r.Date, r => r.Revenue);

        return Enumerable.Range(0, 7)
            .Select(i => today.AddDays(i - 6))
            .Select(day => new RevenueByDayDTO
            {
                Day     = day.ToString("ddd", ptBR),
                Revenue = revenueDict.GetValueOrDefault(day, 0m),
            })
            .ToList();
    }

    private async Task<List<RecentOrderDTO>> GetRecentOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .ToListAsync();

        return orders.Select(o => new RecentOrderDTO
        {
            Id       = o.Id,
            Customer = o.User.Name,
            Status   = o.Status.ToString(),
            Total    = o.TotalPrice,
            Time     = o.CreatedAt.ToString("HH:mm"),
        }).ToList();
    }

    private async Task<List<BestSellerDTO>> GetBestSellers()
    {
        var topSales = await _context.OrderItems
            .GroupBy(oi => oi.ProductId)
            .Select(g => new { ProductId = g.Key, Sales = g.Sum(oi => oi.Quantity) })
            .OrderByDescending(g => g.Sales)
            .Take(5)
            .ToListAsync();

        var productIds = topSales.Select(s => s.ProductId).ToList();
        var products   = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        return topSales.Select(s => new BestSellerDTO
        {
            Name  = products.TryGetValue(s.ProductId, out var p) ? p.Name : "Produto removido",
            Sales = s.Sales,
        }).ToList();
    }

    private async Task<List<CountStatesDTO>> GetPipeline()
    {
        var groups = await _context.Orders
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        return groups.Select(g => new CountStatesDTO
        {
            State = g.Status.ToString(),
            count = g.Count,
        }).ToList();
    }
}

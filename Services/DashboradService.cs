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
        var result = new List<RevenueByDayDTO>();
        var ptBR   = new CultureInfo("pt-BR");

        for (var i = 6; i >= 0; i--)
        {
            var day = today.AddDays(-i);

            var revenue = await _context.Orders
                .Where(o => o.CreatedAt.Date == day && o.Status != OrderStatus.CANCELED)
                .SumAsync(o => o.TotalPrice);

            result.Add(new RevenueByDayDTO
            {
                Day     = day.ToString("ddd", ptBR),
                Revenue = revenue,
            });
        }

        return result;
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

        var result = new List<BestSellerDTO>();

        foreach (var item in topSales)
        {
            var product = await _context.Products.FindAsync(item.ProductId);
            result.Add(new BestSellerDTO
            {
                Name  = product?.Name ?? "Produto removido",
                Sales = item.Sales,
            });
        }

        return result;
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

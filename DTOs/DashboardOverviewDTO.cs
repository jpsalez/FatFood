namespace Lanchonete.DTOs;

public class DashboardOverviewDTO
{
    public decimal DailyRevenue { get; set; }
    public int DailyOrdersCount { get; set; }
    public decimal AverageTicket { get; set; }
    public List<RevenueByDayDTO> RevenueByDay { get; set; } = new();
    public List<RecentOrderDTO> RecentOrders { get; set; } = new();
    public List<BestSellerDTO> BestSellers { get; set; } = new();
    public List<CountStatesDTO> Pipeline { get; set; } = new();
}

namespace Lanchonete.DTOs;

public class RecentOrderDTO
{
    public int Id { get; set; }
    public string Customer { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public string Time { get; set; } = string.Empty;
}

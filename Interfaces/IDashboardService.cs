using Lanchonete.DTOs;

namespace Lanchonete.Interfaces;

public interface IDashboardService
{
    public decimal CalculateDailyRevanue();
    
    public decimal  CalculateWeeklyRevanue();
    
    public decimal CalculateMonthlyRevanue();

    public decimal AvarageTiket();
    
    public OrderResponseDTO orderRecents();
    
    public ProductDTO ProductMustWeekly();
    
    public CountStatesDTO CountStates();


}
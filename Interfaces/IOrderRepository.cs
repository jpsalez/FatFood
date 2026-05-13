using Lanchonete.Models;

namespace Lanchonete.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<List<Order>> GetByUserIdAsync(int userId);
}

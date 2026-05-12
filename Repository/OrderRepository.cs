using Lanchonete.Data;
using Lanchonete.Interfaces;
using Lanchonete.Models;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace Lanchonete.Repository;

public class OrderRepository : IOrderRepository
{

    private readonly DataContext _context;
    
    public OrderRepository(DataContext context)
    {
        _context = context;
    }
    
    public async Task<List<Order>> GetAllAsync()
    {
        return await _context.Orders.Include(x => x.Items).ThenInclude(x => x.Product).ToListAsync();
    }
    

    public async Task<Order?> GetByIdAsync(int id)
    {
        return await _context.Orders.Include(x => x.Items).ThenInclude(x => x.Product).FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Order> AddAsync(Order entity)
    {
        await _context.Orders.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<Order> UpdateAsync(Order entity)
    {
         _context.Orders.Update(entity);
         await _context.SaveChangesAsync();
         return entity;
    }

    public async Task<Order> DeleteAsync(Order entity)
    {
        _context.Orders.Remove(entity);
        await _context.SaveChangesAsync();
        return entity;
    }
}

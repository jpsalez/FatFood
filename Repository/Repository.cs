using System.Linq.Expressions;
using Lanchonete.Data;
using Lanchonete.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Lanchonete.Repository;

public class Repository<T> : IRepository<T> where T : class
{
    private readonly DataContext _context;

    public Repository(DataContext context)
    {
        _context = context;
    }

    public async Task<List<T>> GetAllAsync()
    {
        return await _context.Set<T>().ToListAsync();
    }

    public async Task<T?> GetByIdAsync(int id)
    {
        return await _context.Set<T>().FirstOrDefaultAsync(x => EF.Property<int>(x, "Id") == id);
    }

    public async Task<T> AddAsync(T entity)
    { 
        await _context.Set<T>().AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<T> UpdateAsync(T entity)
    {
        _context.Set<T>().Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public async Task<T> DeleteAsync(T entity)
    {
        _context.Set<T>().Remove(entity);
        await _context.SaveChangesAsync();
        return entity;
    }
}

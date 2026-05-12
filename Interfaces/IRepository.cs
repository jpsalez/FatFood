using Lanchonete.Data;

using Microsoft.AspNetCore.Mvc;

namespace Lanchonete.Interfaces;

public interface IRepository <T> where T : class
{
    public Task<List<T>> GetAllAsync();
    
    public  Task<T?> GetByIdAsync(int id);

    public  Task<T> AddAsync(T entity);

    public  Task<T> UpdateAsync(T entity);

    public Task<T> DeleteAsync(T entity);
}

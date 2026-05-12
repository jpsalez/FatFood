using Lanchonete.Models;

namespace Lanchonete.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<bool> EmailExistsAsync(string email);
    Task<User?> GetByEmailWithRolesAsync(string email);
}

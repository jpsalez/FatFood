using Lanchonete.Models;

namespace Lanchonete.Interfaces;

public interface ITokenService
{
    public string GenerateToken(User user);
}
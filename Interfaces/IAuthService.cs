using Lanchonete.DTOs;

namespace Lanchonete.Interfaces;

public interface IAuthService
{
    Task<AuthResultDTO> RegisterUser(RegisterDTO model);
    Task<AuthResultDTO> Login(LoginDTO model);
}

using Lanchonete.Data;
using Lanchonete.DTOs;
using Lanchonete.Interfaces;
using Lanchonete.Models;
using Lanchonete.Repository;
using Microsoft.AspNetCore.Mvc;
using SecureIdentity.Password;

namespace Lanchonete.Services;

public class AuthService : IAuthService
{
    private readonly ITokenService _tokenService;
    private readonly IUserRepository _userRepository;
    
    public AuthService(ITokenService tokenService, IUserRepository userRepository)
    {
        _tokenService = tokenService;
        _userRepository = userRepository;
    }

    public async Task<AuthResultDTO> RegisterUser(RegisterDTO model)
    {
        var userExists = await _userRepository.EmailExistsAsync(model.Email);
        if (userExists)
            return AuthResultDTO.Fail(false, "Este e-mail já está cadastrado.");
                    
            var user = new User
            {
                Name = model.Username,
                hashPassword = PasswordHasher.Hash(model.Password),
                Email = model.Email,
                Orders = new List<Order>()
            };

            user.Roles = new List<UserRole>
            {
                new UserRole
                {
                    RoleId = 2 // Role 'User'
                }
            };
            
            try
            {
                await _userRepository.AddAsync(user);
                return AuthResultDTO.Ok(true, user,null);
            }
            catch (Exception)
            {
                return AuthResultDTO.Fail(false, "Erro ao salvar usuário no banco de dados.");
            }
    }


    public async Task<AuthResultDTO> Login(LoginDTO model)
    {
        var user = await _userRepository.GetByEmailWithRolesAsync(model.Email);
        
        if(user == null)
            return AuthResultDTO.Fail(false, "Usuário não encontrado.");
        

        if (!PasswordHasher.Verify(user.hashPassword, model.Password))
                return  AuthResultDTO.Fail(false,"E-mail ou senha incorretos.");
        
        
        var token = _tokenService.GenerateToken(user);
        
        return AuthResultDTO.Ok(true, user, token);
    }


        
}

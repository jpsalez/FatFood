using Lanchonete.Models;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Lanchonete.DTOs;

public class AuthResultDTO
{
    public string? Error { get; set; }
    public bool Success { get; set; } 
    public User User { get; set; }
    
    public string Token { get; set; }

    public static AuthResultDTO Ok(bool Success, User User, string token)
    {
        return  new AuthResultDTO
        {
            Success = true,
            User = User,
            Token = token,
        };
    }

    public static AuthResultDTO Fail(bool Success, string error)
    {
        return new AuthResultDTO
        {
            Success = false,
            Error = error,
        };
    }
    
    
    
    
    
    
    
}
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Lanchonete.Extensions;
using Lanchonete.Interfaces;
using Lanchonete.Models;
using Microsoft.IdentityModel.Tokens;

namespace Lanchonete.Services;

public class TokenService  : ITokenService
{
    public string GenerateToken(User user)
    {
        var claims = user.getClaims();
        var TokenHandler = new JwtSecurityTokenHandler();
        var Key = Encoding.ASCII.GetBytes(Configuration.JwtKey);
        var Descriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Key), SecurityAlgorithms.HmacSha256Signature),
            Issuer = "my-lanchonete.com",
            Audience = "my-user",
        };


        var Token = TokenHandler.CreateToken(Descriptor);
        return TokenHandler.WriteToken(Token);
    }




}

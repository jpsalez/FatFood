using System.Security.Claims;
using Lanchonete.Models;

namespace Lanchonete.Extensions;

public static class UserClaimsExtensions
{
    public static IEnumerable<Claim> getClaims(this User user)
    {
        var result = new List<Claim>()
        {
            new Claim(ClaimTypes.Name, user.Email),
            new Claim("UserId", user.Id.ToString())
        };
        
        var userRoles =  user.Roles.Select(x => x.Role.Name).ToList();


        foreach (var role in userRoles )
        {
            result.Add(new Claim(ClaimTypes.Role, role));
        }

        return result;
    }
}
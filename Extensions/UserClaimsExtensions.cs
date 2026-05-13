using Lanchonete.Models;
using System.Security.Claims;

namespace Lanchonete.Extensions;

public static class UserClaimsExtensions
{
    public static IEnumerable<Claim> getClaims(this User user)
    {
        var result = new List<Claim>
        {
            new Claim("name", user.Email),
            new Claim("UserId", user.Id.ToString())
        };

        foreach (var role in user.Roles.Select(x => x.Role.Name))
            result.Add(new Claim("role", role));

        return result;
    }
}
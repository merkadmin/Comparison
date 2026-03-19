using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Services;

public class JwtService
{
	private readonly IConfiguration _config;

	public JwtService(IConfiguration config) => _config = config;

	public string GenerateToken(User user)
	{
		var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Secret"]!));
		var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

		var claims = new[]
		{
			new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
			new Claim(JwtRegisteredClaimNames.Email, user.Email),
			new Claim("userName",                    user.UserName),
			new Claim("privilege",                   user.Privilege.ToString()),
			new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
		};

		var token = new JwtSecurityToken(
			issuer:             _config["Jwt:Issuer"],
			audience:           _config["Jwt:Audience"],
			claims:             claims,
			expires:            DateTime.UtcNow.AddDays(30),
			signingCredentials: creds
		);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}

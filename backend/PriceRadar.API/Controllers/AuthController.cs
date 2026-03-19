using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using BC = BCrypt.Net.BCrypt;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public record SignupRequest(string UserName, string Login, string Email, string Password);
public record LoginRequest(string Email, string Password);
public record GoogleLoginRequest(string IdToken);
public record AuthResponse(string Token, UserDto User);
public record UserDto(long Id, string UserName, string Email, string Login, string Privilege, string? AvatarUrl);

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
	private readonly IUserRepository _users;
	private readonly JwtService      _jwt;
	private readonly IConfiguration  _config;

	public AuthController(IUserRepository users, JwtService jwt, IConfiguration config)
	{
		_users  = users;
		_jwt    = jwt;
		_config = config;
	}

	[HttpPost("signup")]
	public async Task<ActionResult<AuthResponse>> Signup([FromBody] SignupRequest req)
	{
		if (await _users.GetByEmailAsync(req.Email.ToLowerInvariant()) is not null)
			return Conflict(new { message = "Email already in use." });

		if (await _users.GetByLoginAsync(req.Login) is not null)
			return Conflict(new { message = "Login already in use." });

		var user = new User
		{
			UserName     = req.UserName,
			Login        = req.Login,
			Email        = req.Email.ToLowerInvariant(),
			PasswordHash = BC.HashPassword(req.Password),
			Privilege    = UserPrivilege.Regular,
		};

		var created = await _users.CreateAsync(user);
		return Ok(new AuthResponse(_jwt.GenerateToken(created), ToDto(created)));
	}

	[HttpPost("login")]
	public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
	{
		var user = await _users.GetByEmailAsync(req.Email.ToLowerInvariant());
		if (user is null || user.PasswordHash is null || !BC.Verify(req.Password, user.PasswordHash))
			return Unauthorized(new { message = "Invalid email or password." });

		return Ok(new AuthResponse(_jwt.GenerateToken(user), ToDto(user)));
	}

	[HttpPost("google")]
	public async Task<ActionResult<AuthResponse>> GoogleLogin([FromBody] GoogleLoginRequest req)
	{
		GoogleJsonWebSignature.Payload payload;
		try
		{
			payload = await GoogleJsonWebSignature.ValidateAsync(req.IdToken,
				new GoogleJsonWebSignature.ValidationSettings
				{
					Audience = new[] { _config["Google:ClientId"] }
				});
		}
		catch
		{
			return Unauthorized(new { message = "Invalid Google token." });
		}

		var user = await _users.GetByGoogleIdAsync(payload.Subject)
		        ?? await _users.GetByEmailAsync(payload.Email);

		if (user is null)
		{
			user = new User
			{
				UserName  = payload.Name ?? payload.Email,
				Login     = payload.Email,
				Email     = payload.Email.ToLowerInvariant(),
				GoogleId  = payload.Subject,
				AvatarUrl = payload.Picture,
				Privilege = UserPrivilege.Regular,
			};
			user = await _users.CreateAsync(user);
		}
		else if (user.GoogleId is null)
		{
			user.GoogleId  = payload.Subject;
			user.AvatarUrl ??= payload.Picture;
			await _users.UpdateAsync(user.Id, user);
		}

		return Ok(new AuthResponse(_jwt.GenerateToken(user), ToDto(user)));
	}

	[HttpGet("me")]
	[Authorize]
	public async Task<ActionResult<UserDto>> Me()
	{
		var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
		           ?? User.FindFirstValue(JwtRegisteredClaimNames.Sub);
		if (!long.TryParse(idClaim, out var id)) return Unauthorized();

		var user = await _users.GetByIdAsync(id);
		return user is null ? NotFound() : Ok(ToDto(user));
	}

	private static UserDto ToDto(User u) =>
		new(u.Id, u.UserName, u.Email, u.Login, u.Privilege.ToString(), u.AvatarUrl);
}

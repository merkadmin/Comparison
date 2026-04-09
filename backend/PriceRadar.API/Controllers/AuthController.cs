using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using BC = BCrypt.Net.BCrypt;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PriceRadar.API.Services;
using PriceRadar.Core.enums;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public record SignupRequest(string UserName, string Email, string Password, string? Login = null);
public record LoginRequest(string Email, string Password);
public record GoogleLoginRequest(string IdToken);
public record AuthResponse(string Token, UserDto User);
public record UserDto(long Id, string UserName, string Email, string Login, string Privilege, string? AvatarUrl);
public record CreateUserRequest(string UserName, string Email, string Password, string Privilege, string? Login = null);

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
	private readonly IUserRepository _users;
	private readonly ILoggedInUserRepository _loginLog;
	private readonly JwtService _jwt;
	private readonly IConfiguration _config;

	public AuthController(IUserRepository users, ILoggedInUserRepository loginLog, JwtService jwt, IConfiguration config)
	{
		_users    = users;
		_loginLog = loginLog;
		_jwt      = jwt;
		_config   = config;
	}

	private string? ClientIp()
		=> HttpContext.Connection.RemoteIpAddress?.ToString();

	private string? ClientUserAgent()
		=> Request.Headers.UserAgent.ToString() is { Length: > 0 } ua ? ua : null;

	private async Task WriteLog(User user, string method, bool success,
		string? token = null, string? failReason = null)
	{
		await _loginLog.LogAsync(new LoggedInUser
		{
			UserId           = user.Id,
			PrivilegeId      = (int)user.Privilege,
			UserName         = user.UserName,
			Password         = user.PasswordHash,       // stored as BCrypt hash
			Email            = user.Email,
			LoginMethod      = method,
			IsSuccess        = success,
			FailureReason    = failReason,
			IpAddress        = ClientIp(),
			UserAgent        = ClientUserAgent(),
			SessionId        = token is not null ? ExtractJti(token) : null,
			TokenExpiresAt   = token is not null ? DateTime.UtcNow.AddDays(30) : null,
			LoggedInDateTime = DateTime.UtcNow,
			CreatedAt        = DateTime.UtcNow,
		});
	}

	private static string? ExtractJti(string token)
	{
		try
		{
			var handler = new JwtSecurityTokenHandler();
			var jwt = handler.ReadJwtToken(token);
			return jwt.Id; // Jti claim
		}
		catch { return null; }
	}

	[HttpPost("signup")]
	public async Task<ActionResult<AuthResponse>> Signup([FromBody] SignupRequest req)
	{
		var email = req.Email.ToLowerInvariant();

		if (await _users.GetByEmailAsync(email) is not null)
			return Conflict(new { message = "Email already in use." });

		var user = new User
		{
			UserName = req.UserName,
			Login = req.Login ?? email,
			Email = email,
			PasswordHash = BC.HashPassword(req.Password),
			Privilege = DBUserPrivilege.Regular,
		};

		var created = await _users.CreateAsync(user);
		var token = _jwt.GenerateToken(created);
		await WriteLog(created, "Signup", true, token);
		return Ok(new AuthResponse(token, ToDto(created)));
	}

	[HttpPost("login")]
	public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest req)
	{
		var identifier = req.Email.Trim().ToLowerInvariant();
		// Support login by email OR by username/login field
		var user = await _users.GetByEmailAsync(identifier)
				?? await _users.GetByLoginAsync(identifier);

		if (user is null || user.PasswordHash is null || !BC.Verify(req.Password, user.PasswordHash))
		{
			if (user is not null)
				await WriteLog(user, "Password", false, failReason: "Invalid password.");
			return Unauthorized(new { message = "Invalid email or password." });
		}

		var token = _jwt.GenerateToken(user);
		await WriteLog(user, "Password", true, token);
		return Ok(new AuthResponse(token, ToDto(user)));
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
				UserName = payload.Name ?? payload.Email,
				Login = payload.Email,
				Email = payload.Email.ToLowerInvariant(),
				GoogleId = payload.Subject,
				AvatarUrl = payload.Picture,
				Privilege = DBUserPrivilege.Regular,
			};
			user = await _users.CreateAsync(user);
		}
		else if (user.GoogleId is null)
		{
			user.GoogleId = payload.Subject;
			user.AvatarUrl ??= payload.Picture;
			await _users.UpdateAsync(user.Id, user);
		}

		var token = _jwt.GenerateToken(user);
		await WriteLog(user, "Google", true, token);
		return Ok(new AuthResponse(token, ToDto(user)));
	}

	/// <summary>
	/// Creates a user with any privilege level. Requires Root privilege.
	/// </summary>
	[HttpPost("create-user")]
	[Authorize]
	public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserRequest req)
	{
		var callerPrivilege = User.FindFirstValue("privilege");
		if (callerPrivilege != DBUserPrivilege.Root.ToString())
			return Forbid();

		var email = req.Email.ToLowerInvariant();
		if (await _users.GetByEmailAsync(email) is not null)
			return Conflict(new { message = "Email already in use." });

		if (!Enum.TryParse<DBUserPrivilege>(req.Privilege, ignoreCase: true, out var privilege))
			return BadRequest(new { message = $"Unknown privilege '{req.Privilege}'. Valid values: Regular, Premium, Admin." });

		if (privilege == DBUserPrivilege.Root)
			return BadRequest(new { message = "There can only be one root user. Root privilege cannot be assigned." });

		var user = new User
		{
			UserName     = req.UserName,
			Login        = req.Login ?? email,
			Email        = email,
			PasswordHash = BC.HashPassword(req.Password),
			Privilege    = privilege,
		};

		var created = await _users.CreateAsync(user);
		return Ok(ToDto(created));
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

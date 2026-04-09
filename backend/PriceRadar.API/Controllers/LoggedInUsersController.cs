using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[ApiController]
[Route("api/logged-in-users")]
[Authorize]
public class LoggedInUsersController : ControllerBase
{
    private readonly ILoggedInUserRepository _repo;

    public LoggedInUsersController(ILoggedInUserRepository repo) => _repo = repo;

    /// <summary>Get full login history (admin only).</summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LoggedInUser>>> GetAll()
        => Ok(await _repo.GetAllAsync());

    /// <summary>Get recent N login entries (admin only).</summary>
    [HttpGet("recent/{count:int}")]
    public async Task<ActionResult<IEnumerable<LoggedInUser>>> GetRecent(int count = 100)
        => Ok(await _repo.GetRecentAsync(count));

    /// <summary>Get login history for a specific user (admin only).</summary>
    [HttpGet("user/{userId:long}")]
    public async Task<ActionResult<IEnumerable<LoggedInUser>>> GetByUser(long userId)
        => Ok(await _repo.GetByUserIdAsync(userId));
}

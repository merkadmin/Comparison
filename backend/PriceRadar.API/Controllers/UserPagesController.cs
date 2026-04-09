using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;

namespace PriceRadar.API.Controllers;

[ApiController]
[Route("api/user-pages")]
[Authorize]
public class UserPagesController : ControllerBase
{
    private readonly IUserPageRepository _userPages;
    private readonly IAppPageRepository  _appPages;

    public UserPagesController(IUserPageRepository userPages, IAppPageRepository appPages)
    {
        _userPages = userPages;
        _appPages  = appPages;
    }

    private bool IsRoot => User.FindFirstValue("privilege") == "Root";

    private long? CurrentUserId =>
        long.TryParse(
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub"),
            out var id)
        ? id
        : null;

    /// <summary>Root only — returns all page IDs assigned to a specific user.</summary>
    [HttpGet("user/{userId:long}")]
    public async Task<IActionResult> GetPageIdsByUser(long userId)
    {
        if (!IsRoot) return Forbid();
        var pageIds = await _userPages.GetPageIdsByUserIdAsync(userId);
        return Ok(pageIds);
    }

    /// <summary>Root only — replaces the full set of page assignments for a user.</summary>
    [HttpPost("user/{userId:long}")]
    public async Task<IActionResult> SetUserPages(long userId, [FromBody] IEnumerable<long> pageIds)
    {
        if (!IsRoot) return Forbid();
        await _userPages.SetUserPagesAsync(userId, pageIds);
        return NoContent();
    }

    /// <summary>Any authenticated user — returns the routes assigned to the current user.</summary>
    [HttpGet("my-routes")]
    public async Task<IActionResult> GetMyRoutes()
    {
        var userId = CurrentUserId;
        if (userId is null) return Unauthorized();

        var assignedPageIds = (await _userPages.GetPageIdsByUserIdAsync(userId.Value)).ToHashSet();
        var allPages        = await _appPages.GetAllAsync();
        var routes          = allPages
            .Where(p => assignedPageIds.Contains(p.Id))
            .Select(p => p.Route);

        return Ok(routes);
    }
}

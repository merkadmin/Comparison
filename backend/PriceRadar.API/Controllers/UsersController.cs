using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.enums;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public record UserListDto(long Id, string UserName, string Email, string Login, string Privilege, bool IsActive, string? AvatarUrl, DateTime CreatedAt);

[Authorize]
public class UsersController : BaseController<User, IUserRepository>
{
    public UsersController(IUserRepository repo) : base(repo) { }

    private bool IsRoot => User.FindFirstValue("privilege") == "Root";

    private static UserListDto ToDto(User u) =>
        new(u.Id, u.UserName, u.Email, u.Login, u.Privilege.ToString(), u.IsActive, u.AvatarUrl, u.CreatedAt);

    [HttpGet]
    [HttpGet("getAll")]
    public override async Task<IActionResult> GetAll()
    {
        if (!IsRoot) return Forbid();
        var users = await Repo.GetAllAsync();
        return Ok(users.Where(u => u.Privilege != DBUserPrivilege.Root).Select(ToDto));
    }

    [HttpGet("{id:long}")]
    public override async Task<IActionResult> GetById(long id)
    {
        if (!IsRoot) return Forbid();
        var user = await Repo.GetByIdAsync(id);
        return user is null ? NotFound() : Ok(ToDto(user));
    }

    /// <summary>
    /// Creating users is handled by POST /api/auth/create-user (handles password hashing + privilege).
    /// </summary>
    [HttpPost]
    public override Task<IActionResult> Create([FromBody] User entity)
        => Task.FromResult<IActionResult>(StatusCode(405, new { message = "Use POST /api/auth/create-user to create users." }));

    [HttpPut("{id:long}")]
    public override async Task<IActionResult> Update(long id, [FromBody] User entity)
    {
        if (!IsRoot) return Forbid();
        var existing = await Repo.GetByIdAsync(id);
        if (existing is null) return NotFound();
        // Preserve sensitive fields the client does not send
        entity.Id         = id;
        entity.PasswordHash = existing.PasswordHash;
        entity.GoogleId   = existing.GoogleId;
        entity.CreatedAt  = existing.CreatedAt;
        await Repo.UpdateAsync(id, entity);
        return NoContent();
    }

    [HttpDelete("{id:long}")]
    public override async Task<IActionResult> Delete(long id)
    {
        if (!IsRoot) return Forbid();
        var user = await Repo.GetByIdAsync(id);
        if (user is null) return NotFound();
        if (user.Privilege == DBUserPrivilege.Root)
            return BadRequest(new { message = "Cannot delete the root user." });
        await Repo.DeleteAsync(id);
        return NoContent();
    }

    [HttpDelete("bulk")]
    public override async Task<IActionResult> DeleteMany([FromBody] IEnumerable<long> ids)
    {
        if (!IsRoot) return Forbid();
        var idList = ids.ToList();
        var users  = await Task.WhenAll(idList.Select(Repo.GetByIdAsync));
        var safeIds = users
            .Where(u => u is not null && u.Privilege != DBUserPrivilege.Root)
            .Select(u => u!.Id);
        await Repo.DeleteManyAsync(safeIds);
        return NoContent();
    }

    [HttpPatch("{id:long}/active")]
    public override async Task<IActionResult> SetActive(long id, [FromBody] bool isActive)
    {
        if (!IsRoot) return Forbid();
        var user = await Repo.GetByIdAsync(id);
        if (user is null) return NotFound();
        if (user.Privilege == DBUserPrivilege.Root && !isActive)
            return BadRequest(new { message = "Cannot deactivate the root user." });
        await Repo.SetActiveAsync(id, isActive);
        return NoContent();
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[Authorize]
public class AppPagesController : BaseController<AppPage, IAppPageRepository>
{
    public AppPagesController(IAppPageRepository repo) : base(repo) { }

    private bool IsRoot => User.FindFirstValue("privilege") == "Root";

    [HttpPost]
    public override async Task<IActionResult> Create([FromBody] AppPage entity)
    {
        if (!IsRoot) return Forbid();
        return await base.Create(entity);
    }

    [HttpPut("{id:long}")]
    public override async Task<IActionResult> Update(long id, [FromBody] AppPage entity)
    {
        if (!IsRoot) return Forbid();
        return await base.Update(id, entity);
    }

    [HttpDelete("{id:long}")]
    public override async Task<IActionResult> Delete(long id)
    {
        if (!IsRoot) return Forbid();
        return await base.Delete(id);
    }

    [HttpDelete("bulk")]
    public override async Task<IActionResult> DeleteMany([FromBody] IEnumerable<long> ids)
    {
        if (!IsRoot) return Forbid();
        return await base.DeleteMany(ids);
    }

    [HttpPatch("{id:long}/active")]
    public override async Task<IActionResult> SetActive(long id, [FromBody] bool isActive)
    {
        if (!IsRoot) return Forbid();
        return await base.SetActive(id, isActive);
    }
}

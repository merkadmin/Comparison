using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

[Authorize]
public class UsersController : BaseController<User, IUserRepository>
{
	public UsersController(IUserRepository repo) : base(repo) { }
}

using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class OnlineWebSitesController : BaseController<OnlineWebSite, IOnlineWebSiteRepository>
{
    public OnlineWebSitesController(IOnlineWebSiteRepository repo) : base(repo) { }
}

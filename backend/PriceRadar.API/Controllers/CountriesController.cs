using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class CountriesController : BaseController<Country, ICountryRepository>
{
    public CountriesController(ICountryRepository repo) : base(repo) { }
}

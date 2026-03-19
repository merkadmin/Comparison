using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class ProductInformationsController : BaseController<ProductInformation, IProductInformationRepository>
{
    public ProductInformationsController(IProductInformationRepository repo) : base(repo) { }
}

using Microsoft.AspNetCore.Mvc;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;

namespace PriceRadar.API.Controllers;

public class CustomerCommentsController : BaseController<CustomerComment, ICustomerCommentRepository>
{
    public CustomerCommentsController(ICustomerCommentRepository repo) : base(repo) { }
}

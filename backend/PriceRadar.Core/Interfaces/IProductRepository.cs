using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IProductRepository : IBaseRepository<Product>
{
    Task<IEnumerable<Product>> SearchAsync(string keyword);
}

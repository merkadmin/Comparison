using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IPriceListingRepository : IBaseRepository<PriceListing>
{
    Task<IEnumerable<PriceListing>> GetByProductIdAsync(long productId);
}

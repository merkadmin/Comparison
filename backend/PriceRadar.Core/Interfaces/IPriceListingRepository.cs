using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IPriceListingRepository
{
    Task<IEnumerable<PriceListing>> GetByProductIdAsync(string productId);
    Task<PriceListing?> GetByIdAsync(string id);
    Task<PriceListing> CreateAsync(PriceListing listing);
    Task UpdateAsync(string id, PriceListing listing);
    Task DeleteAsync(string id);
}

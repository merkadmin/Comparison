using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IPriceHistoryRepository
{
    Task<IEnumerable<PriceHistory>> GetByProductAndStoreAsync(string productId, string storeId);
    Task<PriceHistory> CreateAsync(PriceHistory history);
}

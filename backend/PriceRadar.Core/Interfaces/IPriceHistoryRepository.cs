using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IPriceHistoryRepository
{
    Task<IEnumerable<PriceHistory>> GetByProductAndStoreAsync(long productId, long storeId);
    Task<PriceHistory> CreateAsync(PriceHistory history);
}

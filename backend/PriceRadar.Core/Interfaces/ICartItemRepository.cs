using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface ICartItemRepository : IBaseRepository<CartItem>
{
    Task<IEnumerable<CartItem>> GetByUserIdAsync(long userId);
    Task<bool> ExistsAsync(long userId, long productItemId);
    Task RemoveByUserItemAsync(long userId, long productItemId);
}

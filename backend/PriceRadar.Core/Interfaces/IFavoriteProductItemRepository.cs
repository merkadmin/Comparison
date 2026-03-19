using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IFavoriteProductItemRepository : IBaseRepository<FavoriteProductItem>
{
    Task<IEnumerable<FavoriteProductItem>> GetByUserIdAsync(long userId);
    Task<bool> ExistsAsync(long userId, long productItemId);
    Task RemoveByUserItemAsync(long userId, long productItemId);
}

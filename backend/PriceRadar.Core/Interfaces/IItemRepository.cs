using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IItemRepository : IBaseRepository<Item>
{
    // Extra query methods beyond standard CRUD
    Task<IEnumerable<Item>> GetByCategoryAsync(long categoryId);
    Task<IEnumerable<Item>> GetByBrandAsync(long brandId);
}

using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IProductItemRepository : IBaseRepository<ProductItem>
{
    // Extra query methods beyond standard CRUD
    Task<IEnumerable<ProductItem>> GetByCategoryAsync(long categoryId);
    Task<IEnumerable<ProductItem>> GetByBrandAsync(long brandId);
}

using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IProductItemSpecificationRepository : IBaseRepository<ProductItemSpecificationRecord>
{
    Task<ProductItemSpecificationRecord?> GetByProductItemIdAsync(long productItemId);
}

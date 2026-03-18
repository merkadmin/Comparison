using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IItemCategoryRepository : IBaseRepository<ItemCategory>
{
	Task DeleteManyAsync(IEnumerable<long> ids);
}

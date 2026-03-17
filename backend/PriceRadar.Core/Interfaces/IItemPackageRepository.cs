using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IItemPackageRepository : IBaseRepository<ItemPackage>
{
	Task<IEnumerable<ItemPackage>> GetActiveAsync();
}

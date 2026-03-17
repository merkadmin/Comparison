using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IItemPackageRepository
{
    Task<IEnumerable<ItemPackage>> GetAllAsync();
    Task<IEnumerable<ItemPackage>> GetActiveAsync();
    Task<ItemPackage?> GetByIdAsync(string id);
    Task<ItemPackage> CreateAsync(ItemPackage package);
    Task UpdateAsync(string id, ItemPackage package);
    Task DeleteAsync(string id);
}

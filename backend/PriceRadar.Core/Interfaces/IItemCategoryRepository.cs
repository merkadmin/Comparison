using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IItemCategoryRepository
{
    Task<IEnumerable<ItemCategory>> GetAllAsync();
    Task<ItemCategory?> GetByIdAsync(string id);
    Task<ItemCategory> CreateAsync(ItemCategory category);
    Task UpdateAsync(string id, ItemCategory category);
    Task DeleteAsync(string id);
}

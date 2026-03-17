using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IItemRepository
{
    Task<IEnumerable<Item>> GetAllAsync();
    Task<Item?> GetByIdAsync(string id);
    Task<IEnumerable<Item>> GetByCategoryAsync(string categoryId);
    Task<IEnumerable<Item>> GetByBrandAsync(string brandId);
    Task<Item> CreateAsync(Item item);
    Task UpdateAsync(string id, Item item);
    Task DeleteAsync(string id);
}

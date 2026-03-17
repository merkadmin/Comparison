using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IItemBrandRepository
{
    Task<IEnumerable<ItemBrand>> GetAllAsync();
    Task<ItemBrand?> GetByIdAsync(string id);
    Task<ItemBrand> CreateAsync(ItemBrand brand);
    Task UpdateAsync(string id, ItemBrand brand);
    Task DeleteAsync(string id);
}

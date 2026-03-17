using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IStoreRepository
{
    Task<IEnumerable<Store>> GetAllAsync();
    Task<Store?> GetByIdAsync(string id);
    Task<Store> CreateAsync(Store store);
    Task UpdateAsync(string id, Store store);
    Task DeleteAsync(string id);
}

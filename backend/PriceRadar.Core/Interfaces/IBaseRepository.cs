namespace PriceRadar.Core.Interfaces;

/// <summary>
/// Generic CRUD contract inherited by all repository interfaces.
/// </summary>
public interface IBaseRepository<T>
{
	Task<IEnumerable<T>> GetAllAsync();
	Task<T?> GetByIdAsync(string id);
	Task<T> CreateAsync(T entity);
	Task UpdateAsync(string id, T entity);
	Task DeleteAsync(string id);
}

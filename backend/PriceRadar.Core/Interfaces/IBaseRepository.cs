namespace PriceRadar.Core.Interfaces;

/// <summary>
/// Generic CRUD contract inherited by all repository interfaces.
/// </summary>
public interface IBaseRepository<T>
{
	Task<IEnumerable<T>> GetAllAsync();
	Task<T?> GetByIdAsync(long id);
	Task<T> CreateAsync(T entity);
	Task UpdateAsync(long id, T entity);
	Task DeleteAsync(long id);
	Task DeleteManyAsync(IEnumerable<long> ids);
}

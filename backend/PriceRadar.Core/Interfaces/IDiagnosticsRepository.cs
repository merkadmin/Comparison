using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IDiagnosticsRepository : IBaseRepository<Diagnostics>
{
    Task<IEnumerable<Diagnostics>> GetByTableNameAsync(string tableName);
    Task<IEnumerable<Diagnostics>> GetByActionAsync(string action);
}

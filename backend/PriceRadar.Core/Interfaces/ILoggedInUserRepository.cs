using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface ILoggedInUserRepository
{
    Task LogAsync(LoggedInUser entry);
    Task<IEnumerable<LoggedInUser>> GetAllAsync();
    Task<IEnumerable<LoggedInUser>> GetByUserIdAsync(long userId);
    Task<IEnumerable<LoggedInUser>> GetRecentAsync(int count = 100);
}

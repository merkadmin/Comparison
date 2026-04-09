namespace PriceRadar.Core.Interfaces;

public interface IUserPageRepository
{
    Task<IEnumerable<long>> GetPageIdsByUserIdAsync(long userId);
    Task SetUserPagesAsync(long userId, IEnumerable<long> pageIds);
}

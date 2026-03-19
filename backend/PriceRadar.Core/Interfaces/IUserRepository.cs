using PriceRadar.Core.Models;

namespace PriceRadar.Core.Interfaces;

public interface IUserRepository : IBaseRepository<User>
{
	Task<User?> GetByEmailAsync(string email);
	Task<User?> GetByLoginAsync(string login);
	Task<User?> GetByGoogleIdAsync(string googleId);
}

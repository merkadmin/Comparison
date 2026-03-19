using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class UserRepository : BaseRepository<User, UserDocument>, IUserRepository
{
	public UserRepository(MongoDbContext context)
		: base(context, context.Users, "users", UserDocument.FromModel) { }

	public async Task<User?> GetByEmailAsync(string email)
	{
		var doc = await _collection.Find(u => u.Email == email && !u.IsDeleted).FirstOrDefaultAsync();
		return doc?.ToModel();
	}

	public async Task<User?> GetByLoginAsync(string login)
	{
		var doc = await _collection.Find(u => u.Login == login && !u.IsDeleted).FirstOrDefaultAsync();
		return doc?.ToModel();
	}

	public async Task<User?> GetByGoogleIdAsync(string googleId)
	{
		var doc = await _collection.Find(u => u.GoogleId == googleId && !u.IsDeleted).FirstOrDefaultAsync();
		return doc?.ToModel();
	}
}

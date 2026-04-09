using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class UserPageRepository : IUserPageRepository
{
    private readonly MongoDbContext _context;
    private readonly IMongoCollection<UserPageDocument> _collection;

    public UserPageRepository(MongoDbContext context)
    {
        _context    = context;
        _collection = context.UserPages;
    }

    public async Task<IEnumerable<long>> GetPageIdsByUserIdAsync(long userId)
    {
        var filter = Builders<UserPageDocument>.Filter.And(
            Builders<UserPageDocument>.Filter.Eq(d => d.UserId, userId),
            Builders<UserPageDocument>.Filter.Eq(d => d.IsDeleted, false));
        var docs = await _collection.Find(filter).ToListAsync();
        return docs.Select(d => d.PageId);
    }

    public async Task SetUserPagesAsync(long userId, IEnumerable<long> pageIds)
    {
        await _collection.DeleteManyAsync(up => up.UserId == userId);

        var idList = pageIds.ToList();
        if (idList.Count == 0) return;

        var docs = new List<UserPageDocument>(idList.Count);
        foreach (var pageId in idList)
        {
            docs.Add(new UserPageDocument
            {
                Id        = await _context.GetNextSequenceAsync("user_page"),
                UserId    = userId,
                PageId    = pageId,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow,
            });
        }

        await _collection.InsertManyAsync(docs);
    }
}

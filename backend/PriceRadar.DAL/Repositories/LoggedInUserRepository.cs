using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class LoggedInUserRepository : ILoggedInUserRepository
{
    private readonly MongoDbContext _context;
    private readonly IMongoCollection<LoggedInUserDocument> _collection;

    public LoggedInUserRepository(MongoDbContext context)
    {
        _context    = context;
        _collection = context.LoggedInUsers;
    }

    public async Task LogAsync(LoggedInUser entry)
    {
        entry.Id = await _context.GetNextSequenceAsync("loggedinusers");
        await _collection.InsertOneAsync(LoggedInUserDocument.FromModel(entry));
    }

    public async Task<IEnumerable<LoggedInUser>> GetAllAsync()
    {
        var docs = await _collection
            .Find(_ => true)
            .SortByDescending(d => d.LoggedInDateTime)
            .ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<IEnumerable<LoggedInUser>> GetByUserIdAsync(long userId)
    {
        var docs = await _collection
            .Find(d => d.UserId == userId)
            .SortByDescending(d => d.LoggedInDateTime)
            .ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<IEnumerable<LoggedInUser>> GetRecentAsync(int count = 100)
    {
        var docs = await _collection
            .Find(_ => true)
            .SortByDescending(d => d.LoggedInDateTime)
            .Limit(count)
            .ToListAsync();
        return docs.Select(d => d.ToModel());
    }
}

using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class PriceHistoryRepository : IPriceHistoryRepository
{
    private readonly MongoDbContext _context;

    public PriceHistoryRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PriceHistory>> GetByProductAndStoreAsync(string productId, string storeId)
    {
        var docs = await _context.PriceHistories
            .Find(h => h.ProductId == productId && h.StoreId == storeId)
            .SortByDescending(h => h.RecordedAt)
            .ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<PriceHistory> CreateAsync(PriceHistory history)
    {
        var doc = PriceHistoryDocument.FromModel(history);
        await _context.PriceHistories.InsertOneAsync(doc);
        return doc.ToModel();
    }
}

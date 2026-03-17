using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class StoreRepository : IStoreRepository
{
    private readonly MongoDbContext _context;

    public StoreRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Store>> GetAllAsync()
    {
        var docs = await _context.Stores.Find(_ => true).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<Store?> GetByIdAsync(string id)
    {
        var doc = await _context.Stores.Find(s => s.Id == id).FirstOrDefaultAsync();
        return doc?.ToModel();
    }

    public async Task<Store> CreateAsync(Store store)
    {
        var doc = StoreDocument.FromModel(store);
        await _context.Stores.InsertOneAsync(doc);
        return doc.ToModel();
    }

    public async Task UpdateAsync(string id, Store store)
    {
        var doc = StoreDocument.FromModel(store);
        await _context.Stores.ReplaceOneAsync(s => s.Id == id, doc);
    }

    public async Task DeleteAsync(string id) =>
        await _context.Stores.DeleteOneAsync(s => s.Id == id);
}

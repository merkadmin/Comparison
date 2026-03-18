using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ItemPackageRepository : IItemPackageRepository
{
    private readonly MongoDbContext _context;

    public ItemPackageRepository(MongoDbContext context) => _context = context;

    public async Task<IEnumerable<ItemPackage>> GetAllAsync()
    {
        var docs = await _context.ItemPackages.Find(_ => true).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<IEnumerable<ItemPackage>> GetActiveAsync()
    {
        var now = DateTime.UtcNow;
        var filter = Builders<ItemPackageDocument>.Filter.And(
            Builders<ItemPackageDocument>.Filter.Eq(p => p.IsActive, true),
            Builders<ItemPackageDocument>.Filter.Or(
                Builders<ItemPackageDocument>.Filter.Eq(p => p.EndDate, null),
                Builders<ItemPackageDocument>.Filter.Gte(p => p.EndDate, now)
            )
        );
        var docs = await _context.ItemPackages.Find(filter).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<ItemPackage?> GetByIdAsync(long id)
    {
        var doc = await _context.ItemPackages.Find(p => p.Id == id).FirstOrDefaultAsync();
        return doc?.ToModel();
    }

    public async Task<ItemPackage> CreateAsync(ItemPackage package)
    {
        var doc = ItemPackageDocument.FromModel(package);
        doc.Id = await _context.GetNextSequenceAsync("itempackages");
        await _context.ItemPackages.InsertOneAsync(doc);
        return doc.ToModel();
    }

    public async Task UpdateAsync(long id, ItemPackage package)
    {
        var doc = ItemPackageDocument.FromModel(package);
        doc.Id = id;
        await _context.ItemPackages.ReplaceOneAsync(p => p.Id == id, doc);
    }

    public async Task DeleteAsync(long id) =>
        await _context.ItemPackages.DeleteOneAsync(p => p.Id == id);
}

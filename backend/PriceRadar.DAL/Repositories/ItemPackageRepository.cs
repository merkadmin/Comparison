using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ItemPackageRepository : BaseRepository<ItemPackage, ItemPackageDocument>, IItemPackageRepository
{
    public ItemPackageRepository(MongoDbContext context)
        : base(context, context.ItemPackages, "itempackages", ItemPackageDocument.FromModel) { }

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
        var docs = await _collection.Find(filter).ToListAsync();
        return docs.Select(d => d.ToModel());
    }
}

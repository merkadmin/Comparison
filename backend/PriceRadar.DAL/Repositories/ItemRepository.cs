using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ItemRepository : BaseRepository<Item, ItemDocument>, IItemRepository
{
    public ItemRepository(MongoDbContext context)
        : base(context, context.Items, "items", ItemDocument.FromModel) { }

    public async Task<IEnumerable<Item>> GetByCategoryAsync(long categoryId)
    {
        var docs = await _collection.Find(i => i.ItemCategoryId == categoryId).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<IEnumerable<Item>> GetByBrandAsync(long brandId)
    {
        var docs = await _collection.Find(i => i.BrandId == brandId).ToListAsync();
        return docs.Select(d => d.ToModel());
    }
}

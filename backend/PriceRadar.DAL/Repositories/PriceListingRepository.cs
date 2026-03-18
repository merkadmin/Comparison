using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class PriceListingRepository : BaseRepository<PriceListing, PriceListingDocument>, IPriceListingRepository
{
    public PriceListingRepository(MongoDbContext context)
        : base(context, context.PriceListings, "pricelistings", PriceListingDocument.FromModel) { }

    public async Task<IEnumerable<PriceListing>> GetByProductIdAsync(long productId)
    {
        var docs = await _collection.Find(l => l.ProductId == productId).ToListAsync();
        return docs.Select(d => d.ToModel());
    }
}

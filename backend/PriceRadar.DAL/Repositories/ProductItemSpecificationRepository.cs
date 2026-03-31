using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ProductItemSpecificationRepository
    : BaseRepository<ProductItemSpecificationRecord, ProductItemSpecificationDocument>,
      IProductItemSpecificationRepository
{
    public ProductItemSpecificationRepository(MongoDbContext context)
        : base(context, context.ProductItemSpecifications, "item_specs", ProductItemSpecificationDocument.FromModel) { }

    public async Task<ProductItemSpecificationRecord?> GetByProductItemIdAsync(long productItemId)
    {
        var filter = Builders<ProductItemSpecificationDocument>.Filter.And(
            Builders<ProductItemSpecificationDocument>.Filter.Eq(d => d.ProductItemId, productItemId),
            Builders<ProductItemSpecificationDocument>.Filter.Eq(d => d.IsDeleted, false));
        var doc = await _collection.Find(filter).FirstOrDefaultAsync();
        return doc?.ToModel();
    }
}

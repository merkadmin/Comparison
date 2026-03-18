using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ProductRepository : BaseRepository<Product, ProductDocument>, IProductRepository
{
    public ProductRepository(MongoDbContext context)
        : base(context, context.Products, "products", ProductDocument.FromModel) { }

    public async Task<IEnumerable<Product>> SearchAsync(string keyword)
    {
        var filter = Builders<ProductDocument>.Filter.Or(
            Builders<ProductDocument>.Filter.Regex(p => p.Name,  new MongoDB.Bson.BsonRegularExpression(keyword, "i")),
            Builders<ProductDocument>.Filter.Regex(p => p.Brand, new MongoDB.Bson.BsonRegularExpression(keyword, "i"))
        );
        var docs = await _collection.Find(filter).ToListAsync();
        return docs.Select(d => d.ToModel());
    }
}

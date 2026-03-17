using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly MongoDbContext _context;

    public ProductRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        var docs = await _context.Products.Find(_ => true).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<Product?> GetByIdAsync(string id)
    {
        var doc = await _context.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
        return doc?.ToModel();
    }

    public async Task<IEnumerable<Product>> SearchAsync(string keyword)
    {
        var filter = Builders<ProductDocument>.Filter.Or(
            Builders<ProductDocument>.Filter.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(keyword, "i")),
            Builders<ProductDocument>.Filter.Regex(p => p.Brand, new MongoDB.Bson.BsonRegularExpression(keyword, "i"))
        );
        var docs = await _context.Products.Find(filter).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<Product> CreateAsync(Product product)
    {
        var doc = ProductDocument.FromModel(product);
        await _context.Products.InsertOneAsync(doc);
        return doc.ToModel();
    }

    public async Task UpdateAsync(string id, Product product)
    {
        var doc = ProductDocument.FromModel(product);
        await _context.Products.ReplaceOneAsync(p => p.Id == id, doc);
    }

    public async Task DeleteAsync(string id) =>
        await _context.Products.DeleteOneAsync(p => p.Id == id);
}

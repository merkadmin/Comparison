using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class PriceListingRepository : IPriceListingRepository
{
    private readonly MongoDbContext _context;

    public PriceListingRepository(MongoDbContext context) => _context = context;

    public async Task<IEnumerable<PriceListing>> GetAllAsync()
    {
        var docs = await _context.PriceListings.Find(_ => true).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<IEnumerable<PriceListing>> GetByProductIdAsync(long productId)
    {
        var docs = await _context.PriceListings.Find(l => l.ProductId == productId).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<PriceListing?> GetByIdAsync(long id)
    {
        var doc = await _context.PriceListings.Find(l => l.Id == id).FirstOrDefaultAsync();
        return doc?.ToModel();
    }

    public async Task<PriceListing> CreateAsync(PriceListing listing)
    {
        var doc = PriceListingDocument.FromModel(listing);
        doc.Id = await _context.GetNextSequenceAsync("pricelistings");
        await _context.PriceListings.InsertOneAsync(doc);
        return doc.ToModel();
    }

    public async Task UpdateAsync(long id, PriceListing listing)
    {
        var doc = PriceListingDocument.FromModel(listing);
        doc.Id = id;
        await _context.PriceListings.ReplaceOneAsync(l => l.Id == id, doc);
    }

    public async Task DeleteAsync(long id) =>
        await _context.PriceListings.DeleteOneAsync(l => l.Id == id);
}

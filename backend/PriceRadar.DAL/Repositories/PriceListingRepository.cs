using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class PriceListingRepository : IPriceListingRepository
{
    private readonly MongoDbContext _context;

    public PriceListingRepository(MongoDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<PriceListing>> GetAllAsync()
    {
        var docs = await _context.PriceListings.Find(_ => true).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<IEnumerable<PriceListing>> GetByProductIdAsync(string productId)
    {
        var docs = await _context.PriceListings.Find(l => l.ProductId == productId).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<PriceListing?> GetByIdAsync(string id)
    {
        var doc = await _context.PriceListings.Find(l => l.Id == id).FirstOrDefaultAsync();
        return doc?.ToModel();
    }

    public async Task<PriceListing> CreateAsync(PriceListing listing)
    {
        var doc = PriceListingDocument.FromModel(listing);
        await _context.PriceListings.InsertOneAsync(doc);
        return doc.ToModel();
    }

    public async Task UpdateAsync(string id, PriceListing listing)
    {
        var doc = PriceListingDocument.FromModel(listing);
        await _context.PriceListings.ReplaceOneAsync(l => l.Id == id, doc);
    }

    public async Task DeleteAsync(string id) =>
        await _context.PriceListings.DeleteOneAsync(l => l.Id == id);
}

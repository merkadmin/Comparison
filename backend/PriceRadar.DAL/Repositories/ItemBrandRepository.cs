using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ItemBrandRepository : IItemBrandRepository
{
    private readonly MongoDbContext _context;

    public ItemBrandRepository(MongoDbContext context) => _context = context;

    public async Task<IEnumerable<ItemBrand>> GetAllAsync()
    {
        var docs = await _context.ItemBrands.Find(_ => true).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<ItemBrand?> GetByIdAsync(long id)
    {
        var doc = await _context.ItemBrands.Find(b => b.Id == id).FirstOrDefaultAsync();
        return doc?.ToModel();
    }

    public async Task<ItemBrand> CreateAsync(ItemBrand brand)
    {
        var doc = ItemBrandDocument.FromModel(brand);
        doc.Id = await _context.GetNextSequenceAsync("itembrands");
        await _context.ItemBrands.InsertOneAsync(doc);
        return doc.ToModel();
    }

    public async Task UpdateAsync(long id, ItemBrand brand)
    {
        var doc = ItemBrandDocument.FromModel(brand);
        doc.Id = id;
        await _context.ItemBrands.ReplaceOneAsync(b => b.Id == id, doc);
    }

    public async Task DeleteAsync(long id) =>
        await _context.ItemBrands.DeleteOneAsync(b => b.Id == id);
}

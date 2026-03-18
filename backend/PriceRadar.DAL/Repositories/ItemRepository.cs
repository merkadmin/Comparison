using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ItemRepository : IItemRepository
{
    private readonly MongoDbContext _context;

    public ItemRepository(MongoDbContext context) => _context = context;

    public async Task<IEnumerable<Item>> GetAllAsync()
    {
        var docs = await _context.Items.Find(_ => true).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<Item?> GetByIdAsync(string id)
    {
        var doc = await _context.Items.Find(i => i.Id == id).FirstOrDefaultAsync();
        return doc?.ToModel();
    }

    public async Task<IEnumerable<Item>> GetByCategoryAsync(string categoryId)
    {
        var docs = await _context.Items.Find(i => i.ItemCategoryId == categoryId).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<IEnumerable<Item>> GetByBrandAsync(string brandId)
    {
        var docs = await _context.Items.Find(i => i.BrandId == brandId).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<Item> CreateAsync(Item item)
    {
        var doc = ItemDocument.FromModel(item);
        await _context.Items.InsertOneAsync(doc);
        return doc.ToModel();
    }

    public async Task UpdateAsync(string id, Item item)
    {
        var doc = ItemDocument.FromModel(item);
        await _context.Items.ReplaceOneAsync(i => i.Id == id, doc);
    }

    public async Task DeleteAsync(string id) =>
        await _context.Items.DeleteOneAsync(i => i.Id == id);
}

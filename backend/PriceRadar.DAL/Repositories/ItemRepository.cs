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

    public async Task<Item?> GetByIdAsync(long id)
    {
        var doc = await _context.Items.Find(i => i.Id == id).FirstOrDefaultAsync();
        return doc?.ToModel();
    }

    public async Task<IEnumerable<Item>> GetByCategoryAsync(long categoryId)
    {
        var docs = await _context.Items.Find(i => i.ItemCategoryId == categoryId).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<IEnumerable<Item>> GetByBrandAsync(long brandId)
    {
        var docs = await _context.Items.Find(i => i.BrandId == brandId).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<Item> CreateAsync(Item item)
    {
        var doc = ItemDocument.FromModel(item);
        doc.Id = await _context.GetNextSequenceAsync("items");
        await _context.Items.InsertOneAsync(doc);
        return doc.ToModel();
    }

    public async Task UpdateAsync(long id, Item item)
    {
        var doc = ItemDocument.FromModel(item);
        doc.Id = id;
        await _context.Items.ReplaceOneAsync(i => i.Id == id, doc);
    }

    public async Task DeleteAsync(long id) =>
        await _context.Items.DeleteOneAsync(i => i.Id == id);
}

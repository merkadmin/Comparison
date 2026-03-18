using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ItemCategoryRepository : IItemCategoryRepository
{
    private readonly MongoDbContext _context;

    public ItemCategoryRepository(MongoDbContext context) => _context = context;

    public async Task<IEnumerable<ItemCategory>> GetAllAsync()
    {
        var docs = await _context.ItemCategories.Find(_ => true).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<ItemCategory?> GetByIdAsync(long id)
    {
        var doc = await _context.ItemCategories.Find(c => c.Id == id).FirstOrDefaultAsync();
        return doc?.ToModel();
    }

    public async Task<ItemCategory> CreateAsync(ItemCategory category)
    {
        var doc = ItemCategoryDocument.FromModel(category);
        doc.Id = await _context.GetNextSequenceAsync("itemcategories");
        await _context.ItemCategories.InsertOneAsync(doc);
        return doc.ToModel();
    }

    public async Task UpdateAsync(long id, ItemCategory category)
    {
        var doc = ItemCategoryDocument.FromModel(category);
        doc.Id = id;
        await _context.ItemCategories.ReplaceOneAsync(c => c.Id == id, doc);
    }

    public async Task DeleteAsync(long id) =>
        await _context.ItemCategories.DeleteOneAsync(c => c.Id == id);

    public async Task DeleteManyAsync(IEnumerable<long> ids) =>
        await _context.ItemCategories.DeleteManyAsync(c => ids.Contains(c.Id));
}

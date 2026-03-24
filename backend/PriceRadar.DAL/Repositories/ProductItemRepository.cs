using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ProductItemRepository : BaseRepository<ProductItem, ProductItemDocument>, IProductItemRepository
{
    public ProductItemRepository(MongoDbContext context)
        : base(context, context.ProductItems, "items", ProductItemDocument.FromModel) { }

    public async Task<IEnumerable<ProductItem>> GetByCategoryAsync(long categoryId)
    {
        // Collect the selected category + all its descendants so items in
        // subcategories are included when a parent category is selected.
        var allCategories = await _context.ItemCategories
            .Find(Builders<ItemCategoryDocument>.Filter.Eq(c => c.IsDeleted, false))
            .ToListAsync();

        var categoryIds = new List<long> { categoryId };
        CollectDescendants(categoryId, allCategories, categoryIds);

        var filter = Builders<ProductItemDocument>.Filter.In(i => i.ItemCategoryId, categoryIds);
        var docs = await _collection.Find(filter).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    private static void CollectDescendants(long parentId, List<ItemCategoryDocument> all, List<long> result)
    {
        foreach (var child in all.Where(c => c.ParentCategoryId == parentId))
        {
            result.Add(child.Id);
            CollectDescendants(child.Id, all, result);
        }
    }

    public async Task<IEnumerable<ProductItem>> GetByBrandAsync(long brandId)
    {
        var docs = await _collection.Find(i => i.BrandId == brandId).ToListAsync();
        return docs.Select(d => d.ToModel());
    }
}

using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ItemCategoryRepository : BaseRepository<ItemCategory, ItemCategoryDocument>
{
	public ItemCategoryRepository(MongoDbContext context)
		: base(context, context.ItemCategories, "itemcategories", ItemCategoryDocument.FromModel) { }
}

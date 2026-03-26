using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories
{
	public class Store_ItemRepository
		: BaseRepository<Store_Item, Store_ItemDocument>, IStore_ItemRepository
	{
		public Store_ItemRepository(MongoDbContext context)
			: base(context, context.Store_Items, "storeItems", Store_ItemDocument.FromModel) { }
	}
}

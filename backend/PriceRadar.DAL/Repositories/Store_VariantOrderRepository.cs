using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories
{
	public class Store_VariantOrderRepository : BaseRepository<Store_VariantOrder, Store_VariantOrderDocument>, IStore_VariantOrderRepository
	{
		public Store_VariantOrderRepository(MongoDbContext context)
			: base(context, context.Store_VariantOrders, "store_variantorders", Store_VariantOrderDocument.FromModel) { }
	}
}

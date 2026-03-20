using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class StoreRepository : BaseRepository<Store, StoreDocument>, IStoreRepository
{
	public StoreRepository(MongoDbContext context)
		: base(context, context.Stores, "stores", StoreDocument.FromModel) { }
}

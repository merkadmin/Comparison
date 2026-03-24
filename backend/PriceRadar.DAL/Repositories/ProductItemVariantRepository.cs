using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories
{
	public class ProductItemVariantRepository : BaseRepository<ProductItemVariant, ProductItemVariantDocument>, IProductItemVariantRepository
	{
		public ProductItemVariantRepository(MongoDbContext context)
			: base(context, context.ProductItemVariants, "itemsVariants", ProductItemVariantDocument.FromModel) { }
	}
}

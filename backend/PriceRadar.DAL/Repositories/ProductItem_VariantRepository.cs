using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories
{
	public class ProductItem_VariantRepository
		: BaseRepository<ProductItem_Variant, ProductItem_VariantDocument>, IProductItem_VariantRepository
	{
		public ProductItem_VariantRepository(MongoDbContext context)
			: base(context, context.ProductItem_Variants, "productItemVariants", ProductItem_VariantDocument.FromModel) { }
	}
}

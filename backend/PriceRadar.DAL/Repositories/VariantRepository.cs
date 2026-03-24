using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories
{
	public class VariantRepository : BaseRepository<Variant, VariantDocument>, IVariantRepository
	{
		public VariantRepository(MongoDbContext context)
			: base(context, context.Variants, "variants", VariantDocument.FromModel) { }
	}
}

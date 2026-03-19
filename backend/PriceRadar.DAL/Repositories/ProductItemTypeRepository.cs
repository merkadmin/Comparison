using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ProductItemTypeRepository : BaseRepository<ProductItemType, ProductItemTypeDocument>, IProductItemTypeRepository
{
    public ProductItemTypeRepository(MongoDbContext context)
        : base(context, context.ProductItemTypes, "productitemtypes", ProductItemTypeDocument.FromModel) { }
}

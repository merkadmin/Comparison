using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ProductTypeRepository : BaseRepository<ProductType, ProductTypeDocument>, IProductTypeRepository
{
    public ProductTypeRepository(MongoDbContext context)
        : base(context, context.ProductTypes, "producttypes", ProductTypeDocument.FromModel) { }
}

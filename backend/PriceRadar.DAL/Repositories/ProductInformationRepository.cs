using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ProductInformationRepository : BaseRepository<ProductInformation, ProductInformationDocument>, IProductInformationRepository
{
    public ProductInformationRepository(MongoDbContext context)
        : base(context, context.ProductInformations, "productinformations", ProductInformationDocument.FromModel) { }
}

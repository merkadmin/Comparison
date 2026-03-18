using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class ItemBrandRepository : BaseRepository<ItemBrand, ItemBrandDocument>, IItemBrandRepository
{
    public ItemBrandRepository(MongoDbContext context)
        : base(context, context.ItemBrands, "itembrands", ItemBrandDocument.FromModel) { }
}

using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class AppPageRepository : BaseRepository<AppPage, AppPageDocument>, IAppPageRepository
{
    public AppPageRepository(MongoDbContext context)
        : base(context, context.AppPages, "apppages", AppPageDocument.FromModel) { }
}

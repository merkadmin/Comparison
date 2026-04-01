using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class OnlineWebSiteRepository
    : BaseRepository<OnlineWebSite, OnlineWebSiteDocument>, IOnlineWebSiteRepository
{
    public OnlineWebSiteRepository(MongoDbContext context)
        : base(context, context.OnlineWebSites, "onlinewebsites", OnlineWebSiteDocument.FromModel) { }
}

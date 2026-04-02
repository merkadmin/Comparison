using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class CountryRepository
    : BaseRepository<Country, CountryDocument>, ICountryRepository
{
    public CountryRepository(MongoDbContext context)
        : base(context, context.Countries, "countries", CountryDocument.FromModel) { }
}

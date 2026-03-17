using MongoDB.Driver;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Context;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(string connectionString, string databaseName)
    {
        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<ProductDocument> Products =>
        _database.GetCollection<ProductDocument>("products");

    public IMongoCollection<StoreDocument> Stores =>
        _database.GetCollection<StoreDocument>("stores");

    public IMongoCollection<PriceListingDocument> PriceListings =>
        _database.GetCollection<PriceListingDocument>("priceListings");

    public IMongoCollection<PriceHistoryDocument> PriceHistories =>
        _database.GetCollection<PriceHistoryDocument>("priceHistories");
}

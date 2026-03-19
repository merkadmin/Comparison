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

	public IMongoCollection<ItemCategoryDocument> ItemCategories =>
		_database.GetCollection<ItemCategoryDocument>("ItemCategory");

	public IMongoCollection<ItemBrandDocument> ItemBrands =>
		_database.GetCollection<ItemBrandDocument>("ItemBrand");

	public IMongoCollection<ItemDocument> Items =>
		_database.GetCollection<ItemDocument>("ProductItem");

	public IMongoCollection<ItemPackageDocument> ItemPackages =>
		_database.GetCollection<ItemPackageDocument>("ItemPackage");

	private IMongoCollection<SequenceDocument> Sequences =>
		_database.GetCollection<SequenceDocument>("_sequences");

	public IMongoCollection<TableNameDocument> TableNames =>
		_database.GetCollection<TableNameDocument>("TableName_s");

	public IMongoCollection<DiagnosticsDocument> Diagnostics =>
		_database.GetCollection<DiagnosticsDocument>("Diagnostics");

	public async Task<long> GetNextSequenceAsync(string name)
	{
		var filter = Builders<SequenceDocument>.Filter.Eq(s => s.Name, name);
		var update = Builders<SequenceDocument>.Update.Inc(s => s.Seq, 1L);
		var options = new FindOneAndUpdateOptions<SequenceDocument>
		{
			ReturnDocument = ReturnDocument.After,
			IsUpsert = true
		};
		var result = await Sequences.FindOneAndUpdateAsync(filter, update, options);
		return result.Seq;
	}
}

using MongoDB.Driver;
using PriceRadar.Core.Models;
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

	public IMongoCollection<ItemCategoryDocument> ItemCategories =>
		_database.GetCollection<ItemCategoryDocument>("ItemCategory");

	public IMongoCollection<ItemBrandDocument> ItemBrands =>
		_database.GetCollection<ItemBrandDocument>("ItemBrand");

	public IMongoCollection<ProductItemDocument> ProductItems =>
		_database.GetCollection<ProductItemDocument>("ProductItem");

	public IMongoCollection<VariantDocument> Variants =>
		_database.GetCollection<VariantDocument>("Variant");

	public IMongoCollection<ProductItem_VariantDocument> ProductItem_Variants =>
		_database.GetCollection<ProductItem_VariantDocument>("ProductItem_Variant");

public IMongoCollection<ItemPackageDocument> ItemPackages =>
		_database.GetCollection<ItemPackageDocument>("ItemPackage");

	private IMongoCollection<SequenceDocument> Sequences =>
		_database.GetCollection<SequenceDocument>("_sequences");

	public IMongoCollection<TableNameDocument> TableNames =>
		_database.GetCollection<TableNameDocument>("TableName_s");

	public IMongoCollection<DiagnosticsDocument> Diagnostics =>
		_database.GetCollection<DiagnosticsDocument>("Diagnostics");

	public IMongoCollection<UserDocument> Users =>
		_database.GetCollection<UserDocument>("Users");

	public IMongoCollection<LoggedInUserDocument> LoggedInUsers =>
		_database.GetCollection<LoggedInUserDocument>("LoggedInUser");

	public IMongoCollection<CustomerCommentDocument> CustomerComments =>
		_database.GetCollection<CustomerCommentDocument>("CustomerComment");

	public IMongoCollection<FavoriteProductItemDocument> FavoriteProductItems =>
		_database.GetCollection<FavoriteProductItemDocument>("FavoriteProductItem");

	public IMongoCollection<CartItemDocument> CartItems =>
		_database.GetCollection<CartItemDocument>("CartItem");

	public IMongoCollection<StoreDocument> Stores =>
		_database.GetCollection<StoreDocument>("Store");

	public IMongoCollection<Store_ItemDocument> Store_Items =>
		_database.GetCollection<Store_ItemDocument>("Store_Item");

	public IMongoCollection<Store_VariantOrderDocument> Store_VariantOrders =>
		_database.GetCollection<Store_VariantOrderDocument>("Store_VariantOrder");

	public IMongoCollection<OnlineWebSiteDocument> OnlineWebSites =>
		_database.GetCollection<OnlineWebSiteDocument>("OnlineWebSite_s");

	public IMongoCollection<ProductTypeDocument> ProductTypes =>
		_database.GetCollection<ProductTypeDocument>("ProductType_s");

	public IMongoCollection<CountryDocument> Countries =>
		_database.GetCollection<CountryDocument>("Country_s");

	// ── Static lookup collections (_s = static/seed) ─────────────────────────
	public IMongoCollection<StaticLookupDocument> StoreTypes =>
		_database.GetCollection<StaticLookupDocument>("StoreType_s");

	public IMongoCollection<StaticLookupDocument> DBStores =>
		_database.GetCollection<StaticLookupDocument>("Store_s");

	public IMongoCollection<StaticLookupDocument> PriceHistoryTypes =>
		_database.GetCollection<StaticLookupDocument>("PriceHistoryType_s");

	public IMongoCollection<StaticLookupDocument> SellingPriceTypes =>
		_database.GetCollection<StaticLookupDocument>("SellingPriceType_s");

	public IMongoCollection<StaticLookupDocument> UserPrivileges =>
		_database.GetCollection<StaticLookupDocument>("UserPrivilege_s");

	// ── Specification category lookups (JSON-based) ─────────────────────────
	public IMongoCollection<SpecificationLookupDocument> SpecificationCategories =>
		_database.GetCollection<SpecificationLookupDocument>("SpecificationCategory_s");

	// ── Product item specifications ──────────────────────────────────────────
	public IMongoCollection<ProductItemSpecificationDocument> ProductItemSpecifications =>
		_database.GetCollection<ProductItemSpecificationDocument>("ProductItem_Specification");

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

using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public abstract class BaseRepository<TModel, TDoc> : IBaseRepository<TModel>
	where TDoc : IDocument<TModel>
{
	protected readonly MongoDbContext _context;
	protected readonly IMongoCollection<TDoc> _collection;
	private readonly string _sequenceName;
	private readonly Func<TModel, TDoc> _fromModel;
	private string EntityName => typeof(TModel).Name;

	protected BaseRepository(
		MongoDbContext context,
		IMongoCollection<TDoc> collection,
		string sequenceName,
		Func<TModel, TDoc> fromModel)
	{
		_context = context;
		_collection = collection;
		_sequenceName = sequenceName;
		_fromModel = fromModel;
	}

	private static FilterDefinition<TDoc> NotDeleted =>
		Builders<TDoc>.Filter.Eq("IsDeleted", false);

	private static FilterDefinition<TDoc> ActiveOnly =>
		Builders<TDoc>.Filter.And(
			Builders<TDoc>.Filter.Eq("IsDeleted", false),
			Builders<TDoc>.Filter.Eq("IsActive", true)
		);

	private async Task LogAsync(string action, long? entityId = null) =>
		await _context.Diagnostics.InsertOneAsync(new DiagnosticsDocument
		{
			Id = await _context.GetNextSequenceAsync("diagnostics"),
			TableName = EntityName,
			Action = action,
			EntityId = entityId,
			Timestamp = DateTime.UtcNow,
		});

	public async Task<IEnumerable<TModel>> GetAllAsync()
	{
		var docs = await _collection.Find(NotDeleted).ToListAsync();
		await LogAsync("Search");
		return docs.Select(d => d.ToModel());
	}

	public async Task<TModel?> GetByIdAsync(long id)
	{
		var filter = Builders<TDoc>.Filter.And(Builders<TDoc>.Filter.Eq("_id", id), ActiveOnly);
		var doc = await _collection.Find(filter).FirstOrDefaultAsync();
		await LogAsync("Search", id);
		return doc is null ? default : doc.ToModel();
	}

	public async Task<TModel> CreateAsync(TModel entity)
	{
		var doc = _fromModel(entity);
		doc.Id = await _context.GetNextSequenceAsync(_sequenceName);
		await _collection.InsertOneAsync(doc);
		await LogAsync("Insert", doc.Id);
		return doc.ToModel();
	}

	public async Task UpdateAsync(long id, TModel entity)
	{
		var doc = _fromModel(entity);
		doc.Id = id;
		await _collection.ReplaceOneAsync(Builders<TDoc>.Filter.Eq("_id", id), doc);
		await LogAsync("Update", id);
	}

	public async Task DeleteAsync(long id)
	{
		var update = Builders<TDoc>.Update.Set("IsDeleted", true).Set("IsActive", false);
		await _collection.UpdateOneAsync(Builders<TDoc>.Filter.Eq("_id", id), update);
		await LogAsync("Delete", id);
	}

	public async Task DeleteManyAsync(IEnumerable<long> ids)
	{
		var idList = ids.ToList();
		var update = Builders<TDoc>.Update.Set("IsDeleted", true).Set("IsActive", false);
		await _collection.UpdateManyAsync(Builders<TDoc>.Filter.In("_id", idList), update);
		foreach (var id in idList)
			await LogAsync("Delete", id);
	}

	public async Task SetActiveAsync(long id, bool isActive)
	{
		var filter = Builders<TDoc>.Filter.And(
			Builders<TDoc>.Filter.Eq("_id", id),
			NotDeleted);
		await _collection.UpdateOneAsync(filter,
			Builders<TDoc>.Update.Set("IsActive", isActive));
		await LogAsync(isActive ? "Activate" : "Deactivate", id);
	}

	public async Task SetActiveManyAsync(IEnumerable<long> ids, bool isActive)
	{
		var idList = ids.ToList();
		var filter = Builders<TDoc>.Filter.And(
			Builders<TDoc>.Filter.In("_id", idList),
			NotDeleted);
		await _collection.UpdateManyAsync(filter,
			Builders<TDoc>.Update.Set("IsActive", isActive));
		var action = isActive ? "Activate" : "Deactivate";
		foreach (var id in idList)
			await LogAsync(action, id);
	}
}

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

	public async Task<IEnumerable<TModel>> GetAllAsync()
	{
		var docs = await _collection.Find(_ => true).ToListAsync();
		return docs.Select(d => d.ToModel());
	}

	public async Task<TModel?> GetByIdAsync(long id)
	{
		var doc = await _collection.Find(Builders<TDoc>.Filter.Eq("_id", id)).FirstOrDefaultAsync();
		return doc is null ? default : doc.ToModel();
	}

	public async Task<TModel> CreateAsync(TModel entity)
	{
		var doc = _fromModel(entity);
		doc.Id = await _context.GetNextSequenceAsync(_sequenceName);
		await _collection.InsertOneAsync(doc);
		return doc.ToModel();
	}

	public async Task UpdateAsync(long id, TModel entity)
	{
		var doc = _fromModel(entity);
		doc.Id = id;
		await _collection.ReplaceOneAsync(Builders<TDoc>.Filter.Eq("_id", id), doc);
	}

	public async Task DeleteAsync(long id) =>
		await _collection.DeleteOneAsync(Builders<TDoc>.Filter.Eq("_id", id));

	public async Task DeleteManyAsync(IEnumerable<long> ids) =>
		await _collection.DeleteManyAsync(Builders<TDoc>.Filter.In("_id", ids));
}

using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class DiagnosticsRepository : BaseRepository<Diagnostics, DiagnosticsDocument>, IDiagnosticsRepository
{
	public DiagnosticsRepository(MongoDbContext context)
		: base(context, context.Diagnostics, "diagnostics", DiagnosticsDocument.FromModel) { }

	public async Task<IEnumerable<Diagnostics>> GetByTableNameAsync(string tableName)
	{
		var docs = await _collection
			.Find(d => d.TableName == tableName && !d.IsDeleted)
			.SortByDescending(d => d.Timestamp)
			.ToListAsync();
		return docs.Select(d => d.ToModel());
	}

	public async Task<IEnumerable<Diagnostics>> GetByActionAsync(string action)
	{
		var docs = await _collection
			.Find(d => d.Action == action && !d.IsDeleted)
			.SortByDescending(d => d.Timestamp)
			.ToListAsync();
		return docs.Select(d => d.ToModel());
	}
}

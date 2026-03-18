using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class TableNameRepository : BaseRepository<TableName, TableNameDocument>, ITableNameRepository
{
	public TableNameRepository(MongoDbContext context)
		: base(context, context.TableNames, "tablenames", TableNameDocument.FromModel) { }
}

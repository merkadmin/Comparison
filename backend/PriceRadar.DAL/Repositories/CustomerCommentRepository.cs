using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class CustomerCommentRepository : BaseRepository<CustomerComment, CustomerCommentDocument>, ICustomerCommentRepository
{
    public CustomerCommentRepository(MongoDbContext context)
        : base(context, context.CustomerComments, "customercomments", CustomerCommentDocument.FromModel) { }
}

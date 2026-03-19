using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class FavoriteProductItemRepository
    : BaseRepository<FavoriteProductItem, FavoriteProductItemDocument>, IFavoriteProductItemRepository
{
    public FavoriteProductItemRepository(MongoDbContext context)
        : base(context, context.FavoriteProductItems, "favoriteproductitems", FavoriteProductItemDocument.FromModel) { }

    public async Task<IEnumerable<FavoriteProductItem>> GetByUserIdAsync(long userId)
    {
        var filter = Builders<FavoriteProductItemDocument>.Filter.And(
            Builders<FavoriteProductItemDocument>.Filter.Eq(d => d.UserId, userId),
            Builders<FavoriteProductItemDocument>.Filter.Eq(d => d.IsDeleted, false));
        var docs = await _collection.Find(filter).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<bool> ExistsAsync(long userId, long productItemId)
    {
        var filter = Builders<FavoriteProductItemDocument>.Filter.And(
            Builders<FavoriteProductItemDocument>.Filter.Eq(d => d.UserId, userId),
            Builders<FavoriteProductItemDocument>.Filter.Eq(d => d.ProductItemId, productItemId),
            Builders<FavoriteProductItemDocument>.Filter.Eq(d => d.IsDeleted, false));
        return await _collection.CountDocumentsAsync(filter) > 0;
    }

    public async Task RemoveByUserItemAsync(long userId, long productItemId)
    {
        var filter = Builders<FavoriteProductItemDocument>.Filter.And(
            Builders<FavoriteProductItemDocument>.Filter.Eq(d => d.UserId, userId),
            Builders<FavoriteProductItemDocument>.Filter.Eq(d => d.ProductItemId, productItemId));
        await _collection.DeleteOneAsync(filter);
    }
}

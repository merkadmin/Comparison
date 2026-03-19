using MongoDB.Driver;
using PriceRadar.Core.Interfaces;
using PriceRadar.Core.Models;
using PriceRadar.DAL.Context;
using PriceRadar.DAL.Documents;

namespace PriceRadar.DAL.Repositories;

public class CartItemRepository
    : BaseRepository<CartItem, CartItemDocument>, ICartItemRepository
{
    public CartItemRepository(MongoDbContext context)
        : base(context, context.CartItems, "cartitems", CartItemDocument.FromModel) { }

    public async Task<IEnumerable<CartItem>> GetByUserIdAsync(long userId)
    {
        var filter = Builders<CartItemDocument>.Filter.And(
            Builders<CartItemDocument>.Filter.Eq(d => d.UserId, userId),
            Builders<CartItemDocument>.Filter.Eq(d => d.IsDeleted, false));
        var docs = await _collection.Find(filter).ToListAsync();
        return docs.Select(d => d.ToModel());
    }

    public async Task<bool> ExistsAsync(long userId, long productItemId)
    {
        var filter = Builders<CartItemDocument>.Filter.And(
            Builders<CartItemDocument>.Filter.Eq(d => d.UserId, userId),
            Builders<CartItemDocument>.Filter.Eq(d => d.ProductItemId, productItemId),
            Builders<CartItemDocument>.Filter.Eq(d => d.IsDeleted, false));
        return await _collection.CountDocumentsAsync(filter) > 0;
    }

    public async Task RemoveByUserItemAsync(long userId, long productItemId)
    {
        var filter = Builders<CartItemDocument>.Filter.And(
            Builders<CartItemDocument>.Filter.Eq(d => d.UserId, userId),
            Builders<CartItemDocument>.Filter.Eq(d => d.ProductItemId, productItemId));
        await _collection.DeleteOneAsync(filter);
    }
}

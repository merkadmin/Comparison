using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonIgnoreExtraElements]
public class UserDocument : IDocument<User>
{
	[BsonId]
	public long Id { get; set; }
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public string UserName { get; set; } = string.Empty;
	public string Login { get; set; } = string.Empty;
	public string? PasswordHash { get; set; }
	public string Email { get; set; } = string.Empty;
	public UserPrivilege Privilege { get; set; } = UserPrivilege.Regular;
	public string? GoogleId { get; set; }
	public string? AvatarUrl { get; set; }
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public User ToModel() => new()
	{
		Id = Id,
		IsActive = IsActive,
		IsDeleted = IsDeleted,
		UserName = UserName,
		Login = Login,
		PasswordHash = PasswordHash,
		Email = Email,
		Privilege = Privilege,
		GoogleId = GoogleId,
		AvatarUrl = AvatarUrl,
		CreatedAt = CreatedAt,
	};

	public static UserDocument FromModel(User u) => new()
	{
		Id = u.Id,
		IsActive = u.IsActive,
		IsDeleted = u.IsDeleted,
		UserName = u.UserName,
		Login = u.Login,
		PasswordHash = u.PasswordHash,
		Email = u.Email,
		Privilege = u.Privilege,
		GoogleId = u.GoogleId,
		AvatarUrl = u.AvatarUrl,
		CreatedAt = u.CreatedAt,
	};
}

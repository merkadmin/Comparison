using PriceRadar.Core.enums;

namespace PriceRadar.Core.Models;

public class User
{
	public long Id { get; set; }
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; } = false;
	public string UserName { get; set; } = string.Empty;
	public string Login { get; set; } = string.Empty;
	public string? PasswordHash { get; set; }
	public string Email { get; set; } = string.Empty;
	public DBUserPrivilege Privilege { get; set; } = DBUserPrivilege.Regular;
	public string? GoogleId { get; set; }
	public string? AvatarUrl { get; set; }
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

namespace PriceRadar.Core.Models;

public enum UserPrivilege { Regular = 0, Premium = 1, Admin = 2 }

public class User
{
	public long          Id           { get; set; }
	public bool          IsActive     { get; set; } = true;
	public bool          IsDeleted    { get; set; } = false;
	public string        UserName     { get; set; } = string.Empty;
	public string        Login        { get; set; } = string.Empty;
	public string?       PasswordHash { get; set; }
	public string        Email        { get; set; } = string.Empty;
	public UserPrivilege Privilege    { get; set; } = UserPrivilege.Regular;
	public string?       GoogleId     { get; set; }
	public string?       AvatarUrl    { get; set; }
	public DateTime      CreatedAt    { get; set; } = DateTime.UtcNow;
}

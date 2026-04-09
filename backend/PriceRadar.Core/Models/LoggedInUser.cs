namespace PriceRadar.Core.Models;

public class LoggedInUser
{
    public long     Id                { get; set; }
    public long     UserId            { get; set; }
    public int      PrivilegeId       { get; set; }
    public string   UserName          { get; set; } = string.Empty;

    /// <summary>Stored as BCrypt hash — never plain text.</summary>
    public string?  Password          { get; set; }

    public string   Email             { get; set; } = string.Empty;

    /// <summary>"Password" | "Google" | "Signup"</summary>
    public string   LoginMethod       { get; set; } = "Password";

    public bool     IsSuccess         { get; set; } = true;
    public string?  FailureReason     { get; set; }

    public string?  IpAddress         { get; set; }
    public string?  UserAgent         { get; set; }

    /// <summary>JWT Jti claim — unique identifier for the issued token.</summary>
    public string?  SessionId         { get; set; }

    public DateTime? TokenExpiresAt   { get; set; }

    public DateTime LoggedInDateTime  { get; set; } = DateTime.UtcNow;
    public DateTime? LoggedOutDateTime { get; set; }
    public DateTime CreatedAt         { get; set; } = DateTime.UtcNow;
}

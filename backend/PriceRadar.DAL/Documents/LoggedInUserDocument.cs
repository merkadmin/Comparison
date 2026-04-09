using MongoDB.Bson.Serialization.Attributes;
using PriceRadar.Core.Models;

namespace PriceRadar.DAL.Documents;

[BsonCollection("LoggedInUser")]
public class LoggedInUserDocument : IDocument<LoggedInUser>
{
    [BsonId]
    public long      Id                { get; set; }
    public bool      IsActive          { get; set; } = true;
    public bool      IsDeleted         { get; set; } = false;
    public long      UserId            { get; set; }
    public int       PrivilegeId       { get; set; }
    public string    UserName          { get; set; } = string.Empty;
    public string?   Password          { get; set; }
    public string    Email             { get; set; } = string.Empty;
    public string    LoginMethod       { get; set; } = "Password";
    public bool      IsSuccess         { get; set; } = true;
    public string?   FailureReason     { get; set; }
    public string?   IpAddress         { get; set; }
    public string?   UserAgent         { get; set; }
    public string?   SessionId         { get; set; }
    public DateTime? TokenExpiresAt    { get; set; }
    public DateTime  LoggedInDateTime  { get; set; } = DateTime.UtcNow;
    public DateTime? LoggedOutDateTime { get; set; }
    public DateTime  CreatedAt         { get; set; } = DateTime.UtcNow;

    public LoggedInUser ToModel() => new()
    {
        Id                = Id,
        UserId            = UserId,
        PrivilegeId       = PrivilegeId,
        UserName          = UserName,
        Password          = Password,
        Email             = Email,
        LoginMethod       = LoginMethod,
        IsSuccess         = IsSuccess,
        FailureReason     = FailureReason,
        IpAddress         = IpAddress,
        UserAgent         = UserAgent,
        SessionId         = SessionId,
        TokenExpiresAt    = TokenExpiresAt,
        LoggedInDateTime  = LoggedInDateTime,
        LoggedOutDateTime = LoggedOutDateTime,
        CreatedAt         = CreatedAt,
    };

    public static LoggedInUserDocument FromModel(LoggedInUser m) => new()
    {
        Id                = m.Id,
        UserId            = m.UserId,
        PrivilegeId       = m.PrivilegeId,
        UserName          = m.UserName,
        Password          = m.Password,
        Email             = m.Email,
        LoginMethod       = m.LoginMethod,
        IsSuccess         = m.IsSuccess,
        FailureReason     = m.FailureReason,
        IpAddress         = m.IpAddress,
        UserAgent         = m.UserAgent,
        SessionId         = m.SessionId,
        TokenExpiresAt    = m.TokenExpiresAt,
        LoggedInDateTime  = m.LoggedInDateTime,
        LoggedOutDateTime = m.LoggedOutDateTime,
        CreatedAt         = m.CreatedAt,
    };
}

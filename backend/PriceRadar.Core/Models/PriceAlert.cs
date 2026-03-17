namespace PriceRadar.Core.Models;

public class PriceAlert
{
    public string? Id { get; set; }
    public string UserEmail { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;
    public decimal TargetPrice { get; set; }
    public bool IsNotified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
